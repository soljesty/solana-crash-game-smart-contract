#!/bin/bash

# Ensure we have a Solana keypair
if [ ! -f $HOME/.config/solana/id.json ]; then
    echo "Generating new Solana keypair..."
    solana-keygen new --no-passphrase -o $HOME/.config/solana/id.json
fi

# Set Solana config to devnet
echo "Setting Solana config to devnet..."
solana config set --url https://api.devnet.solana.com

# Display info
echo "Solana setup complete"
echo "Keypair: $(solana address)"
echo "Network: $(solana config get | grep "RPC URL:" | cut -d ' ' -f 3)"

# Ensure we have the latest Anchor version
echo "Ensuring latest Anchor version..."
avm install latest
avm use latest

echo "⚓ Anchor version: $(anchor --version)"
echo "☀️ Solana version: $(solana --version)"

# Setup complete
echo "✅ Development environment setup complete" 