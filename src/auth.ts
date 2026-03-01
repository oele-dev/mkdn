import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface MkdnConfig {
  accountId: string;
  apiToken: string;
}

function configDir(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg || join(homedir(), ".config");
  return join(base, "mkdn");
}

function configPath(): string {
  return join(configDir(), "config.json");
}

export function getConfig(): MkdnConfig | null {
  const envAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const envApiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (envAccountId && envApiToken) {
    return { accountId: envAccountId, apiToken: envApiToken };
  }

  const path = configPath();
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, "utf-8");
    const data = JSON.parse(raw);
    if (data.accountId && data.apiToken) return data as MkdnConfig;
    return null;
  } catch {
    return null;
  }
}

export function saveConfig(config: MkdnConfig): void {
  const dir = configDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath(), JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}

export function clearConfig(): void {
  const path = configPath();
  if (existsSync(path)) unlinkSync(path);
}

export function hasConfig(): boolean {
  return getConfig() !== null;
}
