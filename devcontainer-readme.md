# Solana + Anchor Development Container

This project includes a complete development container setup for Solana and Anchor framework development.

## Prerequisites

To use this development environment, you need:

- [Docker](https://www.docker.com/products/docker-desktop/) installed and running
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

## Getting Started

1. Clone this repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" (or use the command palette: `Remote-Containers: Reopen in Container`)
4. Wait for the container to build (this may take several minutes the first time)
5. Once the container is running, you'll have a complete Solana development environment

## What's Included

- **Base Image**: Ubuntu 22.04
- **Tools**:
  - Rust + Cargo
  - Solana CLI (v1.17.7)
  - Anchor Framework (latest)
  - Node.js 18 + Yarn
- **VS Code Extensions**:
  - Rust Analyzer
  - Solana and Anchor development plugins

## Using the Development Environment

### Running Tests

```bash
# Run Anchor tests on a local validator
anchor test

# Run specific test file
anchor test --skip-build tests/specific-test.ts
```

### Deploying Programs

```bash
# Build the program
anchor build

# Deploy to devnet (default)
anchor deploy

# Deploy to a different network
solana config set --url https://api.mainnet-beta.solana.com
anchor deploy
```

### Local Validator

```bash
# Start a local validator
solana-test-validator

# In another terminal, configure for local development
solana config set --url localhost
```

### Getting Devnet SOL

```bash
solana airdrop 2  # Get 2 SOL on devnet for testing
```

## Port Forwarding

- Port 8899 is exposed for connecting to a local Solana validator

## Customization

You can modify the container configuration in the `.devcontainer` folder:

- `Dockerfile`: Customize the container build
- `devcontainer.json`: Change VS Code settings, extensions, and more
- `post-start.sh`: Modify environment setup that happens on container start

## Troubleshooting

- **Permission Issues**: If you encounter permission problems, the UID/GID in the Dockerfile might need adjustment
- **Build Failures**: Make sure Docker has enough resources allocated (memory, CPU)
- **Network Issues**: Ensure ports aren't in use by other applications

## License

This development container configuration is provided under the MIT License. Feel free to use and modify it for your projects. 