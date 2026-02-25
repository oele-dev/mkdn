export { createClient } from "./client.js";
export type { ClientOptions, ConversionResult, MkdnClient } from "./client.js";
export { getConfig, saveConfig, clearConfig, hasConfig } from "./auth.js";
export type { MkdnConfig } from "./auth.js";
export {
  SUPPORTED_FORMATS,
  isSupported,
  getMimeType,
  getSupportedExtensions,
} from "./formats.js";
export type { SupportedFormat } from "./formats.js";

import { createClient } from "./client.js";
import { getConfig } from "./auth.js";
import type { ConversionResult } from "./client.js";

/**
 * Convenience function that uses saved credentials to convert files.
 */
export async function convert(
  files: string | string[]
): Promise<ConversionResult[]> {
  const config = getConfig();
  if (!config) {
    throw new Error(
      "No credentials found. Run `mkdn auth` to set up your Cloudflare account."
    );
  }

  const client = createClient(config);
  const filePaths = Array.isArray(files) ? files : [files];
  return client.convert(filePaths);
}
