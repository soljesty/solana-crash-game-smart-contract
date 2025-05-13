# Crash Game Admin CLI Guide

This guide shows how to use the admin keypair to perform admin-only operations such as resolving bets.

## Prerequisites

- Solana CLI installed
- Anchor CLI installed
- Access to the admin keypair (`tests/admin.json`)

## Setup Environment

```bash
# Set Solana config to use localhost
solana config set --url localhost

# Set the admin keypair as the default signer
solana config set --keypair ./tests/admin.json
```

## Resolving Bets via CLI

To resolve a bet for a user, you must be the admin (using the admin keypair). This example shows how to resolve a bet for a user with a win amount of 1 SOL:

```bash
# Replace USER_PUBKEY with the actual user's public key
anchor call resolveBet USER_PUBKEY 1000000000 \
  --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## Verifying Balances

To check a user's on-chain balance:

```bash
# This uses getProgramAccounts to find the user's balance PDA
solana program show-accounts Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## Example Admin Operations Flow

1. Initialize game (if not already done):
   ```bash
   anchor call initialize --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```

2. User deposits funds (user operation)

3. User places a bet (user operation)

4. Admin resolves the bet with winnings:
   ```bash
   anchor call resolveBet USER_PUBKEY 300000000 \
     --program-id Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
   ```

5. User withdraws funds (user operation)

## Security Reminder

Keep the admin.json file secure as it has full authority over the game's operation, including resolving bets with arbitrary win amounts. 