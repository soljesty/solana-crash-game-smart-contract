#!/bin/bash

# Exit on error
set -e

echo "🔍 Setting up Solana environment..."

# Check if Solana is installed
if ! command -v solana &> /dev/null; then
    echo "❌ Solana CLI not found. Please install Solana CLI first."
    exit 1
fi

# Check if anchor is installed
if ! command -v anchor &> /dev/null; then
    echo "❌ Anchor CLI not found. Please install Anchor CLI first."
    exit 1
fi

# Check if a keypair exists, if not create one
if [ ! -f ~/.config/solana/id.json ]; then
    echo "🔑 Generating a new Solana keypair..."
    solana-keygen new --no-passphrase
fi

# Set to localhost for tests
echo "🌐 Setting Solana config to localhost..."
solana config set --url localhost

# Display current configuration
echo "⚙️ Current Solana configuration:"
solana config get

# Build the program
echo "🔨 Building the Anchor program..."
anchor build

# Run the tests
echo "🧪 Running tests..."
anchor test

# Show completion message
echo "✅ Tests completed!" 