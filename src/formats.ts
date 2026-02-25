import { extname } from "node:path";

export interface SupportedFormat {
  extension: string;
  mimeType: string;
}

export const SUPPORTED_FORMATS: SupportedFormat[] = [
  { extension: ".pdf", mimeType: "application/pdf" },
  { extension: ".docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  { extension: ".xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  { extension: ".xlsm", mimeType: "application/vnd.ms-excel.sheet.macroEnabled.12" },
  { extension: ".xlsb", mimeType: "application/vnd.ms-excel.sheet.binary.macroEnabled.12" },
  { extension: ".xls", mimeType: "application/vnd.ms-excel" },
  { extension: ".et", mimeType: "application/vnd.ms-excel" },
  { extension: ".ods", mimeType: "application/vnd.oasis.opendocument.spreadsheet" },
  { extension: ".odt", mimeType: "application/vnd.oasis.opendocument.text" },
  { extension: ".csv", mimeType: "text/csv" },
  { extension: ".html", mimeType: "text/html" },
  { extension: ".htm", mimeType: "text/html" },
  { extension: ".xml", mimeType: "application/xml" },
  { extension: ".svg", mimeType: "image/svg+xml" },
  { extension: ".jpeg", mimeType: "image/jpeg" },
  { extension: ".jpg", mimeType: "image/jpeg" },
  { extension: ".png", mimeType: "image/png" },
  { extension: ".webp", mimeType: "image/webp" },
  { extension: ".numbers", mimeType: "application/vnd.apple.numbers" },
];

const FORMAT_MAP = new Map(
  SUPPORTED_FORMATS.map((f) => [f.extension.toLowerCase(), f.mimeType])
);

export function isSupported(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return FORMAT_MAP.has(ext);
}

export function getMimeType(filePath: string): string | null {
  const ext = extname(filePath).toLowerCase();
  return FORMAT_MAP.get(ext) ?? null;
}

export function getSupportedExtensions(): string[] {
  return SUPPORTED_FORMATS.map((f) => f.extension);
}
