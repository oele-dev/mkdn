#!/usr/bin/env node

import { createInterface } from "node:readline/promises";
import { stdin, stdout, stderr, argv, exit } from "node:process";
import { writeFileSync } from "node:fs";
import { getConfig, saveConfig, clearConfig, hasConfig } from "./auth.js";
import { createClient } from "./client.js";
import { getSupportedExtensions, isSupported } from "./formats.js";

const VERSION = "0.1.0";

const HELP = `mkdn ${VERSION}
Convert files to Markdown using Cloudflare Workers AI

Usage:
  mkdn <files...> [options]      Convert files to Markdown
  mkdn auth                      Set up Cloudflare credentials
  mkdn auth status               Show current auth status
  mkdn auth logout               Remove stored credentials
  mkdn formats                   List supported file formats
  mkdn --help                    Show this help
  mkdn --version                 Show version

Convert options:
  -o, --output <file>            Write output to file instead of stdout
  --json                         Output raw JSON response
  --type <ext>                   File type hint when reading from stdin
  -                              Read from stdin (requires --type)

Auth options:
  --account-id <id>              Cloudflare Account ID (non-interactive)
  --token <token>                Cloudflare API Token (non-interactive)

Examples:
  mkdn file.pdf                  Convert and print to stdout
  mkdn file.pdf -o output.md    Convert and save to file
  mkdn file.pdf file.docx       Convert multiple files
  mkdn file.pdf | pbcopy        Convert and copy to clipboard
  mkdn file.pdf --json          Show raw JSON with token count
  cat file.pdf | mkdn - --type pdf   Convert from stdin`;

function parseArgs(args: string[]) {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      flags.help = true;
    } else if (arg === "--version" || arg === "-v") {
      flags.version = true;
    } else if (arg === "--json") {
      flags.json = true;
    } else if (arg === "-o" || arg === "--output") {
      flags.output = args[++i] ?? "";
    } else if (arg === "--type") {
      flags.type = args[++i] ?? "";
    } else if (arg === "--account-id") {
      flags.accountId = args[++i] ?? "";
    } else if (arg === "--token") {
      flags.token = args[++i] ?? "";
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

async function promptInput(prompt: string): Promise<string> {
  const rl = createInterface({ input: stdin, output: stderr });
  try {
    const answer = await rl.question(prompt);
    return answer.trim();
  } finally {
    rl.close();
  }
}

async function handleAuth(
  positional: string[],
  flags: Record<string, string | boolean>
): Promise<void> {
  const sub = positional[1];

  if (sub === "status") {
    const config = getConfig();
    if (config) {
      const masked = config.apiToken.slice(0, 8) + "..." + config.apiToken.slice(-4);
      console.log(`Account ID: ${config.accountId}`);
      console.log(`API Token:  ${masked}`);
    } else {
      console.log("Not authenticated. Run `mkdn auth` to set up credentials.");
    }
    return;
  }

  if (sub === "logout") {
    clearConfig();
    console.log("Credentials removed.");
    return;
  }

  let accountId = flags.accountId as string | undefined;
  let apiToken = flags.token as string | undefined;

  if (!accountId || !apiToken) {
    console.error("Set up your Cloudflare credentials for mkdn.\n");
    console.error("You need:");
    console.error("  1. Account ID — from Cloudflare dashboard URL or API");
    console.error("  2. API Token  — create at https://dash.cloudflare.com/profile/api-tokens\n");

    accountId = accountId || (await promptInput("Cloudflare Account ID: "));
    apiToken = apiToken || (await promptInput("Cloudflare API Token: "));
  }

  if (!accountId || !apiToken) {
    console.error("Error: Account ID and API Token are required.");
    exit(1);
  }

  saveConfig({ accountId, apiToken });
  console.log("Credentials saved.");
}

function handleFormats(): void {
  const exts = getSupportedExtensions();
  console.log("Supported formats:\n");
  console.log(exts.map((e) => `  ${e}`).join("\n"));
}

async function readStdin(): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function handleConvert(
  files: string[],
  flags: Record<string, string | boolean>
): Promise<void> {
  const config = getConfig();
  if (!config) {
    console.error("Not authenticated. Run `mkdn auth` first.");
    exit(1);
  }

  const client = createClient(config);
  const asJson = flags.json === true;
  const output = flags.output as string | undefined;

  if (files.includes("-")) {
    const type = flags.type as string | undefined;
    if (!type) {
      console.error("Reading from stdin requires --type (e.g., --type pdf)");
      exit(1);
    }

    const ext = type.startsWith(".") ? type : `.${type}`;
    const filename = `stdin${ext}`;

    if (!isSupported(filename)) {
      console.error(`Unsupported format: ${ext}. Run \`mkdn formats\` to see supported types.`);
      exit(1);
    }

    const buffer = await readStdin();
    const result = await client.convertBuffer(Buffer.from(buffer), filename);

    if (result.format === "error") {
      console.error(`Error converting stdin: ${result.error}`);
      exit(1);
    }

    if (asJson) {
      console.log(JSON.stringify(result, null, 2));
    } else if (output) {
      writeFileSync(output, result.data);
      console.error(`Written to ${output}`);
    } else {
      process.stdout.write(result.data);
    }
    return;
  }

  for (const file of files) {
    if (!isSupported(file)) {
      console.error(`Unsupported format: ${file}. Run \`mkdn formats\` to see supported types.`);
      exit(1);
    }
  }

  const results = await client.convert(files);

  const errors = results.filter((r) => r.format === "error");
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`Error converting ${e.name}: ${e.error}`);
    }
    if (errors.length === results.length) exit(1);
  }

  const successful = results.filter((r) => r.format === "markdown");

  if (asJson) {
    console.log(JSON.stringify(successful, null, 2));
  } else if (output) {
    const combined = successful.map((r) => r.data).join("\n\n---\n\n");
    writeFileSync(output, combined);
    console.error(`Written to ${output} (${successful.length} file${successful.length === 1 ? "" : "s"})`);
  } else {
    for (let i = 0; i < successful.length; i++) {
      if (i > 0) process.stdout.write("\n\n---\n\n");
      process.stdout.write(successful[i].data);
    }
  }
}

async function main(): Promise<void> {
  const { flags, positional } = parseArgs(argv.slice(2));

  if (flags.help) {
    console.log(HELP);
    return;
  }

  if (flags.version) {
    console.log(VERSION);
    return;
  }

  if (positional.length === 0) {
    console.log(HELP);
    return;
  }

  const command = positional[0];

  if (command === "auth") {
    await handleAuth(positional, flags);
    return;
  }

  if (command === "formats") {
    handleFormats();
    return;
  }

  await handleConvert(positional, flags);
}

main().catch((err: Error) => {
  console.error(`Error: ${err.message}`);
  exit(1);
});
