use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke_signed, system_instruction};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod crash_game {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let authority = &mut ctx.accounts.authority;
        authority.admin = ctx.accounts.admin.key();
        msg!("Game authority initialized with admin: {}", authority.admin);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let user_balance = &mut ctx.accounts.user_balance;
        let user = &ctx.accounts.user;
        let vault = &ctx.accounts.vault;

        // Transfer SOL from user to vault
        invoke_signed(
            &system_instruction::transfer(
                &user.key(),
                &vault.key(),
                amount,
            ),
            &[
                user.to_account_info(),
                vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            &[],
        )?;

        // Update user's balance
        user_balance.balance = user_balance.balance.checked_add(amount).ok_or(ErrorCode::OverflowError)?;
        msg!("Deposited {} SOL. New balance: {}", amount, user_balance.balance);
        
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let user_balance = &mut ctx.accounts.user_balance;
        let user = &ctx.accounts.user;
        let vault = &ctx.accounts.vault;
        
        let amount = user_balance.balance;
        if amount == 0 {
            return Err(ErrorCode::InsufficientFunds.into());
        }

        // Zero the balance before transfer to prevent reentrancy
        user_balance.balance = 0;
        
        // Transfer SOL from vault to user
        let vault_bump = *ctx.bumps.get("vault").ok_or(ErrorCode::BumpNotFound)?;
        let vault_seeds = &[b"vault".as_ref(), &[vault_bump]];
        let signer_seeds = &[vault_seeds];
        
        invoke_signed(
            &system_instruction::transfer(
                &vault.key(),
                &user.key(),
                amount,
            ),
            &[
                vault.to_account_info(),
                user.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
            signer_seeds,
        )?;
        
        msg!("Withdrawn {} SOL. Balance reset to 0", amount);
        
        Ok(())
    }

    pub fn place_bet(ctx: Context<PlaceBet>, amount: u64) -> Result<()> {
        let user_balance = &mut ctx.accounts.user_balance;
        
        // Check if user has enough balance
        if user_balance.balance < amount {
            return Err(ErrorCode::InsufficientFunds.into());
        }
        
        // Deduct amount from user's balance
        user_balance.balance = user_balance.balance.checked_sub(amount).ok_or(ErrorCode::UnderflowError)?;
        msg!("Placed bet of {} SOL. Remaining balance: {}", amount, user_balance.balance);
        
        Ok(())
    }

    pub fn resolve_bet(ctx: Context<ResolveBet>, win_amount: u64) -> Result<()> {
        let user_balance = &mut ctx.accounts.user_balance;
        
        // Add win amount to user's balance
        user_balance.balance = user_balance.balance.checked_add(win_amount).ok_or(ErrorCode::OverflowError)?;
        msg!("Added winnings of {} SOL. New balance: {}", win_amount, user_balance.balance);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init, 
        payer = admin, 
        space = 8 + 32,
        seeds = [b"game_authority"],
        bump
    )]
    pub authority: Account<'info, GameAuthority>,
    
    #[account(mut)]
    pub admin: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 8,
        seeds = [user.key().as_ref(), b"balance"],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,
    
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    /// CHECK: This is the vault PDA that holds SOL
    pub vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [user.key().as_ref(), b"balance"],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,
    
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    /// CHECK: This is the vault PDA that holds SOL
    pub vault: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlaceBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [user.key().as_ref(), b"balance"],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,
}

#[derive(Accounts)]
pub struct ResolveBet<'info> {
    #[account(
        mut,
        seeds = [b"game_authority"],
        bump
    )]
    pub authority: Account<'info, GameAuthority>,
    
    #[account(
        mut,
        constraint = authority.admin == admin.key() @ ErrorCode::Unauthorized
    )]
    pub admin: Signer<'info>,
    
    #[account(
        mut,
        seeds = [user.key().as_ref(), b"balance"],
        bump
    )]
    pub user_balance: Account<'info, UserBalance>,
    
    /// CHECK: This account is only used for PDA derivation
    pub user: UncheckedAccount<'info>,
}

#[account]
pub struct GameAuthority {
    pub admin: Pubkey,
}

#[account]
pub struct UserBalance {
    pub balance: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient funds")]
    InsufficientFunds,
    
    #[msg("Overflow occurred")]
    OverflowError,
    
    #[msg("Underflow occurred")]
    UnderflowError,
    
    #[msg("Unauthorized access")]
    Unauthorized,
    
    #[msg("Bump not found")]
    BumpNotFound,
} 