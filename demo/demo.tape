Output demo/demo.gif

Set Shell "bash"
Set FontSize 16
Set Width 900
Set Height 450
Set Theme "Catppuccin Mocha"
Set Padding 20
Set TypingSpeed 50ms

Env CLOUDFLARE_ACCOUNT_ID "your-account-id"
Env CLOUDFLARE_API_TOKEN "your-api-token"

Type "echo '# Convert multiple file types to Markdown — here is a demo with a PDF'"
Enter
Sleep 500ms

Type "npx @oele_dev/mkdn demo/sample.pdf"
Enter
Sleep 8s

Type "echo '# Save to file'"
Enter
Sleep 500ms

Type "npx @oele_dev/mkdn demo/sample.pdf -o output.md && cat output.md"
Enter
Sleep 6s
