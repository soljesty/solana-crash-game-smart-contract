# Solana + Anchor Development Container

This folder contains configuration for a VSCode development container with all the tools needed to develop, test, and deploy Solana smart contracts using the Anchor framework.

## Features

- Ubuntu-based development environment
- Pre-installed tools:
  - Rust + Cargo
  - Solana CLI
  - Anchor CLI + AVM (Anchor Version Manager)
  - Node.js + Yarn
- VSCode extensions:
  - rust-analyzer
  - Better TOML
  - Crates (for Rust dependency management)
  - Solana VSCode Plugin
  - Solana Anchor Helpers

## Getting Started

1. Ensure you have Docker and VSCode with the Remote Containers extension installed
2. Open this project in VSCode
3. When prompted, select "Reopen in Container"
4. Wait for the container build to complete (this may take several minutes the first time)

## Container Capabilities

- `solana-test-validator`: Run a local Solana validator (port 8899 is exposed)
- `anchor test`: Run Anchor tests for your project
- `anchor deploy`: Deploy your program to Solana devnet
- `solana` CLI commands for interacting with the blockchain

## Configuration

- By default, the container connects to Solana devnet
- A keypair is automatically generated if one doesn't exist
- To add additional dependencies or tools, modify the Dockerfile

## Workflow Tips

1. Run `solana airdrop 2` to get test SOL on devnet
2. Use `anchor test` to run tests with the local validator
3. Run `anchor build` to build your program
4. Deploy with `anchor deploy`

## Port Forwarding

- Port 8899 is exposed for the local Solana validator
- Connect to it from your host with `http://localhost:8899`

## Troubleshooting

- If you encounter file permission issues, you may need to adjust the UID/GID in the Dockerfile
- For validator connectivity issues, ensure port 8899 is not already in use on your host 