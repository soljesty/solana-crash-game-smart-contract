# Solana Crash Game Vault System

A production-ready Solana smart contract for a Crash game vault system, built using the Anchor framework.

## Features

- Game authority management through PDAs
- Secure deposit/withdrawal system with SOL
- On-chain user balance tracking
- Bet placement and resolution
- Admin-only controls for resolving bets

## Smart Contract Instructions

1. **initialize(authority)**  
   - Creates the game authority account (PDA) with the signer as the admin.

2. **deposit(user, amount)**  
   - Transfers SOL from the user wallet to a vault PDA.  
   - Increases the user's on-chain balance (stored in a PDA).

3. **withdraw(user)**  
   - Transfers the full balance back to the user's wallet.  
   - Resets their on-chain balance to 0.

4. **place_bet(user, amount)**  
   - Deducts SOL from the user's on-chain balance.

5. **resolve_bet(user, win_amount)**  
   - Admin-only function. Adds winnings to the user's balance.

## Technical Architecture

- Vault PDA: `[b"vault"]`
- User Balance PDA: `[user_pubkey, b"balance"]`
- Game Authority PDA: `game_authority` initialized via `initialize`.

## Security Features

- Reentrancy protection by zeroing balance before withdrawals
- Overflow/underflow prevention with checked math operations
- Unauthorized access prevention with `Signer` and authority checks

## Testing

The contract includes comprehensive tests for all instructions:
- Test deposit (check SOL moved + balance increased)
- Test withdraw (check SOL returned + balance reset)
- Test place_bet (balance deducted)
- Test resolve_bet (admin adds winnings)

## Usage

For admin operations (like `resolve_bet`), use the generated `admin.json` keypair in the `/tests` directory.

## License

MIT 