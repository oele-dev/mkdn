# mkdn

Convert files to Markdown using [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/features/markdown-conversion/).

Works as a **CLI** and as a **Node.js library** — zero runtime dependencies.

## Install

```bash
npm install -g mkdn
```

Or use directly with npx:

```bash
npx mkdn file.pdf
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

## Requirements

- Node.js 18+
- Cloudflare account (free tier works)

## License

MIT
