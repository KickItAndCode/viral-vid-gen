#!/bin/bash

# Script to fix Cursor extension installation for Claude Code

echo "Fixing Cursor extension installation for Claude Code..."

# Clean up any existing corrupted files
echo "Cleaning up corrupted extension files..."
rm -f /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor/claude-code.vsix

# Create vendor directory if it doesn't exist
mkdir -p /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor

# Download the extension fresh
echo "Downloading Claude Code extension..."
cd /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/vendor

# Use curl with follow redirects and proper headers
curl -L -o claude-code.vsix \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  https://github.com/anthropics/claude-code/releases/latest/download/claude-code.vsix

# Verify the downloaded file
echo "Verifying downloaded file..."
if [ ! -f claude-code.vsix ]; then
    echo "Error: Failed to download extension file"
    exit 1
fi

# Check if it's a valid zip file (VSIX files are zip files)
if ! unzip -t claude-code.vsix >/dev/null 2>&1; then
    echo "Error: Downloaded file is not a valid VSIX/ZIP file"
    echo "File size: $(ls -lh claude-code.vsix | awk '{print $5}')"
    exit 1
fi

echo "Extension file downloaded successfully!"
echo "File size: $(ls -lh claude-code.vsix | awk '{print $5}')"

# Now try to install it in Cursor
echo "Installing extension in Cursor..."
cursor --install-extension claude-code.vsix

echo "Installation complete!"