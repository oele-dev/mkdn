# mkdn

[![npm version](https://img.shields.io/npm/v/@oele_dev/mkdn.svg)](https://www.npmjs.com/package/@oele_dev/mkdn)
[![license](https://img.shields.io/npm/l/@oele_dev/mkdn.svg)](https://github.com/oele-dev/mkdn/blob/main/LICENSE)

Convert files to Markdown using [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/).

Works as a **CLI** and as a **Node.js library** — zero runtime dependencies.

## Install

```bash
npm install -g @oele_dev/mkdn
```

Or use directly with npx:

```bash
npx @oele_dev/mkdn file.pdf
```

## Setup

mkdn uses the Cloudflare Workers AI API. You need a free [Cloudflare account](https://dash.cloudflare.com/sign-up).

1. Get your **Account ID** from the Cloudflare dashboard
2. Create an **API Token** at https://dash.cloudflare.com/profile/api-tokens
3. Run:

```bash
mkdn auth
```

For CI/scripts, use non-interactive mode:

```bash
mkdn auth --account-id YOUR_ID --token YOUR_TOKEN
```

Or set environment variables (useful for CI/Docker):

```bash
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-api-token
mkdn file.pdf
```

Environment variables take priority over saved credentials.

## CLI Usage

```bash
# Convert a file (output to stdout)
mkdn file.pdf

# Save to file
mkdn file.pdf -o output.md

# Multiple files
mkdn file.pdf document.docx spreadsheet.xlsx

# Pipe to clipboard (macOS)
mkdn file.pdf | pbcopy

# JSON output (includes token count)
mkdn file.pdf --json

# Read from stdin
cat file.pdf | mkdn - --type pdf

# List supported formats
mkdn formats
```

## Library Usage

```typescript
import { convert, createClient } from 'mkdn'

// Uses saved credentials (~/.config/mkdn/config.json)
const results = await convert('document.pdf')
console.log(results[0].data)    // markdown string
console.log(results[0].tokens)  // estimated token count

// Multiple files
const results = await convert(['file.pdf', 'doc.docx'])

// With explicit credentials
const client = createClient({
  accountId: 'your-account-id',
  apiToken: 'your-api-token'
})
const results = await client.convert(['file.pdf'])

// From buffer
const buffer = fs.readFileSync('file.pdf')
const result = await client.convertBuffer(buffer, 'file.pdf')
```

## Supported Formats

| Format | Extensions |
|--------|-----------|
| PDF | `.pdf` |
| Word | `.docx` |
| Excel | `.xlsx`, `.xlsm`, `.xlsb`, `.xls`, `.et` |
| OpenDocument | `.ods`, `.odt` |
| CSV | `.csv` |
| HTML | `.html`, `.htm` |
| XML | `.xml` |
| SVG | `.svg` |
| Images | `.jpeg`, `.jpg`, `.png`, `.webp` |
| Apple Numbers | `.numbers` |

## How It Works

mkdn sends files directly to the [Cloudflare Workers AI toMarkdown API](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/). Conversion is **free for most formats**. Image conversion uses AI models for object detection and may use your Workers AI free tier allocation.

Your files are processed on Cloudflare's edge network and are not stored.

## Auth Management

```bash
mkdn auth            # Set up credentials (interactive)
mkdn auth status     # Show current credentials
mkdn auth logout     # Remove stored credentials
```

Credentials are stored in `~/.config/mkdn/config.json` (or `$XDG_CONFIG_HOME/mkdn/config.json`).

## Why mkdn?

| | mkdn | Pandoc | Markitdown | Docling |
|---|---|---|---|---|
| Install | `npx mkdn` | System package | `pip install` | `pip install` |
| Dependencies | Zero | Haskell runtime | Python + extras | Python + ML models |
| Image OCR | Yes (AI) | No | Limited | Yes (heavy) |
| Setup | 1 min | Varies | Varies | Complex |
| Runs on | Cloudflare edge | Local | Local | Local |

mkdn is the fastest path from "I have a file" to "I have Markdown". No Python, no system packages, no ML models to download.

## Requirements

- Node.js 18+
- Cloudflare account (free tier works)

## License

MIT
