# Solana Crash Game - Gitpod Runner

This project contains a complete Solana Crash Game smart contract built with Anchor Framework. You can run and test it directly in Gitpod without any local installation.

## One-Click Run

Click the button below to launch this project in Gitpod:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/YOUR_USERNAME/crash-game)

*Note: Replace `YOUR_USERNAME` with your actual GitHub username after pushing this to a GitHub repository.*

## What Happens When You Launch

When you launch the project in Gitpod:

1. The container environment will be set up with:
   - Solana CLI tools
   - Anchor Framework
   - Rust
   - Node.js and Yarn

2. Automatically:
   - A Solana keypair will be generated
   - The project will be built with `anchor build`
   - Tests will run with `anchor test`

3. You'll see the test results in the terminal

## Manual Testing

If you want to run tests again or try other commands:

```bash
# Run the tests
anchor test

# Build the program
anchor build

# Deploy to devnet (after requesting SOL)
solana airdrop 2
anchor deploy

# Check account data
solana account <ACCOUNT_ADDRESS>
```

## How It Works

- `.gitpod.yml` - Configures the Gitpod environment
- `.devcontainer` - Contains the Docker configuration for the development environment
- `programs/crash_game/src/lib.rs` - The Solana smart contract code
- `tests/crash_game.ts` - The test file that verifies contract functionality

## Features Tested

- Initialize game authority
- Deposit SOL to vault
- Place bets
- Resolve bets with admin privileges
- Withdraw SOL

## Troubleshooting

If the tests don't automatically run:

1. Check the terminal output for any errors
2. Try running `anchor test` manually
3. If the build fails, try:
   ```bash
   yarn install
   anchor build
   anchor test
   ``` 