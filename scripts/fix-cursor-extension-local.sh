#!/bin/bash

# Script to fix Cursor extension installation for Claude Code (user-level)

echo "Fixing Cursor extension installation for Claude Code..."

# Create a temporary directory for the download
TEMP_DIR="$HOME/.claude-code-temp"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download the extension
echo "Downloading Claude Code extension..."
curl -L -o claude-code.vsix \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
  https://github.com/anthropics/claude-code/releases/latest/download/claude-code.vsix

# Verify the downloaded file
echo "Verifying downloaded file..."
if [ ! -f claude-code.vsix ]; then
    echo "Error: Failed to download extension file"
    exit 1
fi

# Check file size
FILE_SIZE=$(ls -l claude-code.vsix | awk '{print $5}')
echo "Downloaded file size: $FILE_SIZE bytes"

if [ "$FILE_SIZE" -lt 1000 ]; then
    echo "Error: File seems too small, might be corrupted"
    cat claude-code.vsix
    exit 1
fi

# Check if it's a valid zip file
if ! unzip -t claude-code.vsix >/dev/null 2>&1; then
    echo "Error: Downloaded file is not a valid VSIX/ZIP file"
    exit 1
fi

echo "Extension file downloaded successfully!"

# Install using the full path
echo "Installing extension in Cursor..."
cursor --install-extension "$TEMP_DIR/claude-code.vsix"

# Clean up
echo "Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "Installation complete!"