import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { getMimeType, isSupported } from "./formats.js";
import type { SupportedFormat } from "./formats.js";

export interface ClientOptions {
  accountId: string;
  apiToken: string;
}

export interface ConversionResult {
  name: string;
  mimeType: string;
  format: "markdown" | "error";
  tokens: number;
  data: string;
  error?: string;
}

interface CloudflareResponse {
  result: ConversionResult[];
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export interface MkdnClient {
  convert(filePaths: string[]): Promise<ConversionResult[]>;
  convertBuffer(buffer: Uint8Array, filename: string): Promise<ConversionResult>;
  formats(): Promise<SupportedFormat[]>;
}

export function createClient(options: ClientOptions): MkdnClient {
  const { accountId, apiToken } = options;
  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/tomarkdown`;

  async function request(
    url: string,
    init?: RequestInit
  ): Promise<CloudflareResponse> {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        ...init?.headers,
      },
    });

    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Authentication failed. Run `mkdn auth` to update your credentials."
      );
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Cloudflare API error (${res.status}): ${text}`);
    }

    return res.json() as Promise<CloudflareResponse>;
  }

  return {
    async convert(filePaths: string[]): Promise<ConversionResult[]> {
      if (filePaths.length === 0) {
        throw new Error("No files provided.");
      }

      const form = new FormData();

      for (const filePath of filePaths) {
        if (!isSupported(filePath)) {
          throw new Error(
            `Unsupported format: ${filePath}. Run \`mkdn formats\` to see supported types.`
          );
        }

        const content = readFileSync(filePath);
        const mime = getMimeType(filePath) ?? "application/octet-stream";
        const blob = new Blob([new Uint8Array(content)], { type: mime });
        form.append("files", blob, basename(filePath));
      }

      const response = await request(baseUrl, {
        method: "POST",
        body: form,
      });

      if (!response.success) {
        const msg = response.errors.map((e) => e.message).join(", ");
        throw new Error(`Conversion failed: ${msg}`);
      }

      return response.result;
    },

    async convertBuffer(
      buffer: Uint8Array,
      filename: string
    ): Promise<ConversionResult> {
      const mime = getMimeType(filename) ?? "application/octet-stream";
      const blob = new Blob([new Uint8Array(buffer)], { type: mime });
      const form = new FormData();
      form.append("files", blob, filename);

      const response = await request(baseUrl, {
        method: "POST",
        body: form,
      });

      if (!response.success) {
        const msg = response.errors.map((e) => e.message).join(", ");
        throw new Error(`Conversion failed: ${msg}`);
      }

      return response.result[0];
    },

    async formats(): Promise<SupportedFormat[]> {
      const response = await request(`${baseUrl}/supported`);
      return response.result as unknown as SupportedFormat[];
    },
  };
}
