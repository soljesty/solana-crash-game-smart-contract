import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CrashGame } from "../target/types/crash_game";
import { expect } from "chai";
import * as fs from "fs";

describe("crash_game", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CrashGame as Program<CrashGame>;
  
  // Test accounts
  const admin = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();
  
  // Save admin keypair for later use with CLI
  const adminKeypairFile = './tests/admin.json';
  fs.writeFileSync(
    adminKeypairFile,
    JSON.stringify(Array.from(admin.secretKey))
  );
  
  // PDAs
  const [gameAuthority] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_authority")],
    program.programId
  );
  
  const [userBalance] = anchor.web3.PublicKey.findProgramAddressSync(
    [user.publicKey.toBuffer(), Buffer.from("balance")],
    program.programId
  );
  
  const [vault] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    program.programId
  );

  // Fund test accounts
  before(async () => {
    // Airdrop 2 SOL to admin
    const adminAirdropSignature = await provider.connection.requestAirdrop(
      admin.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(adminAirdropSignature);
    
    // Airdrop 2 SOL to user
    const userAirdropSignature = await provider.connection.requestAirdrop(
      user.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(userAirdropSignature);
    
    console.log("Admin pubkey:", admin.publicKey.toString());
    console.log("User pubkey:", user.publicKey.toString());
  });

  it("Initializes the game authority", async () => {
    await program.methods
      .initialize()
      .accounts({
        authority: gameAuthority,
        admin: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([admin])
      .rpc();
    
    // Fetch the authority account and verify
    const authorityAccount = await program.account.gameAuthority.fetch(gameAuthority);
    expect(authorityAccount.admin.toString()).to.equal(admin.publicKey.toString());
    console.log("Game authority initialized with admin:", authorityAccount.admin.toString());
  });

  it("Deposits SOL into vault", async () => {
    const depositAmount = new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Get user balance before deposit
    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    
    await program.methods
      .deposit(depositAmount)
      .accounts({
        user: user.publicKey,
        userBalance: userBalance,
        vault: vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    
    // Verify SOL was transferred
    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
    const vaultBalance = await provider.connection.getBalance(vault);
    
    expect(userBalanceBefore - userBalanceAfter).to.be.greaterThan(
      depositAmount.toNumber()
    ); // Account for transaction fees
    
    expect(vaultBalance).to.equal(depositAmount.toNumber());
    
    // Verify on-chain balance was updated
    const userBalanceAccount = await program.account.userBalance.fetch(userBalance);
    expect(userBalanceAccount.balance.toString()).to.equal(depositAmount.toString());
    
    console.log("Deposited", depositAmount.toString(), "lamports");
    console.log("User on-chain balance:", userBalanceAccount.balance.toString(), "lamports");
    console.log("Vault balance:", vaultBalance.toString(), "lamports");
  });

  it("Places a bet", async () => {
    const betAmount = new anchor.BN(0.2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Get user balance before bet
    const userBalanceAccountBefore = await program.account.userBalance.fetch(userBalance);
    
    await program.methods
      .placeBet(betAmount)
      .accounts({
        user: user.publicKey,
        userBalance: userBalance,
      })
      .signers([user])
      .rpc();
    
    // Verify on-chain balance was deducted
    const userBalanceAccountAfter = await program.account.userBalance.fetch(userBalance);
    const expectedBalance = userBalanceAccountBefore.balance.sub(betAmount);
    
    expect(userBalanceAccountAfter.balance.toString()).to.equal(expectedBalance.toString());
    
    console.log("Placed bet of", betAmount.toString(), "lamports");
    console.log("User on-chain balance after bet:", userBalanceAccountAfter.balance.toString(), "lamports");
  });

  it("Resolves a bet (admin adds winnings)", async () => {
    const winAmount = new anchor.BN(0.3 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Get user balance before resolving bet
    const userBalanceAccountBefore = await program.account.userBalance.fetch(userBalance);
    
    await program.methods
      .resolveBet(winAmount)
      .accounts({
        authority: gameAuthority,
        admin: admin.publicKey,
        userBalance: userBalance,
        user: user.publicKey,
      })
      .signers([admin])
      .rpc();
    
    // Verify on-chain balance was increased
    const userBalanceAccountAfter = await program.account.userBalance.fetch(userBalance);
    const expectedBalance = userBalanceAccountBefore.balance.add(winAmount);
    
    expect(userBalanceAccountAfter.balance.toString()).to.equal(expectedBalance.toString());
    
    console.log("Added winnings of", winAmount.toString(), "lamports");
    console.log("User on-chain balance after win:", userBalanceAccountAfter.balance.toString(), "lamports");
  });

  it("Withdraws SOL from vault", async () => {
    // Get user and vault balance before withdrawal
    const userBalanceBefore = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceBefore = await provider.connection.getBalance(vault);
    const userOnChainBalance = await program.account.userBalance.fetch(userBalance);
    
    await program.methods
      .withdraw()
      .accounts({
        user: user.publicKey,
        userBalance: userBalance,
        vault: vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();
    
    // Verify SOL was transferred back to user
    const userBalanceAfter = await provider.connection.getBalance(user.publicKey);
    const vaultBalanceAfter = await provider.connection.getBalance(vault);
    
    expect(userBalanceAfter).to.be.greaterThan(userBalanceBefore); // User received funds
    expect(vaultBalanceAfter).to.be.lessThan(vaultBalanceBefore); // Vault sent funds
    
    // Verify on-chain balance was reset to 0
    const userBalanceAccountAfter = await program.account.userBalance.fetch(userBalance);
    expect(userBalanceAccountAfter.balance.toNumber()).to.equal(0);
    
    console.log("Withdrawn", userOnChainBalance.balance.toString(), "lamports");
    console.log("User on-chain balance after withdrawal:", userBalanceAccountAfter.balance.toString(), "lamports");
  });
}); 