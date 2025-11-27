import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BountyBoard } from "../target/types/bounty_board";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

describe("BountyBoard", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BountyBoard as Program<BountyBoard>;

  const creator = anchor.web3.Keypair.generate();
  const claimer = anchor.web3.Keypair.generate();
  const otherUser = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to test users
    await airdrop(provider.connection, creator.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
    await airdrop(provider.connection, claimer.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
    await airdrop(provider.connection, otherUser.publicKey, 5 * anchor.web3.LAMPORTS_PER_SOL);
  });

  let boardPda: PublicKey;
  let boardBump: number;

  describe("Initialize Board", () => {
    it("Should successfully initialize bounty board", async () => {
      [boardPda, boardBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("bounty_board"), creator.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeBoard()
        .accounts({
          authority: creator.publicKey,
          board: boardPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      const boardData = await program.account.bountyBoard.fetch(boardPda);
      assert.strictEqual(boardData.authority.toString(), creator.publicKey.toString());
      assert.strictEqual(boardData.taskCount.toNumber(), 0);
    });
  });

  let taskPda1: PublicKey;
  let taskBump1: number;

  describe("Create Task", () => {
    it("Should successfully create a task", async () => {
      const title = "Build a website";
      const description = "Create a responsive website for my business";
      const bountyAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

      [taskPda1, taskBump1] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), boardPda.toBuffer(), new anchor.BN(0).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .createTask(title, description, bountyAmount)
        .accounts({
          creator: creator.publicKey,
          board: boardPda,
          task: taskPda1,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      const taskData = await program.account.task.fetch(taskPda1);
      assert.strictEqual(taskData.title, title);
      assert.strictEqual(taskData.description, description);
      assert.strictEqual(taskData.bountyAmount.toNumber(), bountyAmount.toNumber());
      assert.deepEqual(taskData.status, { created: {} });
    });

    it("Should fail when title too long", async () => {
      const longTitle = "A".repeat(101);
      const description = "test";
      const bountyAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

      const [taskPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), boardPda.toBuffer(), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      try {
        await program.methods
          .createTask(longTitle, description, bountyAmount)
          .accounts({
            creator: creator.publicKey,
            board: boardPda,
            task: taskPda2,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([creator])
          .rpc();
        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error.message.includes("TitleTooLong"));
      }
    });

    it("Should fail when bounty amount is 0", async () => {
      const title = "Invalid bounty";
      const description = "test";
      const bountyAmount = new anchor.BN(0);

      const [taskPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), boardPda.toBuffer(), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      try {
        await program.methods
          .createTask(title, description, bountyAmount)
          .accounts({
            creator: creator.publicKey,
            board: boardPda,
            task: taskPda2,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([creator])
          .rpc();
        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error.message.includes("InvalidBountyAmount"));
      }
    });
  });

  describe("Claim Task", () => {
    it("Should successfully claim a task", async () => {
      await program.methods
        .claimTask()
        .accounts({
          claimer: claimer.publicKey,
          task: taskPda1,
        })
        .signers([claimer])
        .rpc();

      const taskData = await program.account.task.fetch(taskPda1);
      assert.deepEqual(taskData.status, { claimed: {} });
      assert.strictEqual(taskData.claimer.toString(), claimer.publicKey.toString());
    });

    it("Should fail when task already claimed", async () => {
      try {
        await program.methods
          .claimTask()
          .accounts({
            claimer: otherUser.publicKey,
            task: taskPda1,
          })
          .signers([otherUser])
          .rpc();
        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error.message.includes("TaskAlreadyClaimed"));
      }
    });
  });

  describe("Submit Completion", () => {
    it("Should successfully submit completion", async () => {
      const proof = "https://github.com/user/website-repo";

      await program.methods
        .submitCompletion(proof)
        .accounts({
          claimer: claimer.publicKey,
          task: taskPda1,
        })
        .signers([claimer])
        .rpc();

      const taskData = await program.account.task.fetch(taskPda1);
      assert.deepEqual(taskData.status, { completed: {} });
      assert.strictEqual(taskData.proof, proof);
    });

    it("Should fail when non-claimer submits", async () => {
      try {
        await program.methods
          .submitCompletion("proof")
          .accounts({
            claimer: otherUser.publicKey,
            task: taskPda1,
          })
          .signers([otherUser])
          .rpc();
        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error.message.includes("Unauthorized"));
      }
    });
  });

  describe("Approve Completion", () => {
    it("Should successfully approve completion and transfer bounty", async () => {
      const claimerBalanceBefore = await provider.connection.getBalance(claimer.publicKey);

      await program.methods
        .approveCompletion()
        .accounts({
          creator: creator.publicKey,
          task: taskPda1,
          claimer: claimer.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      const taskData = await program.account.task.fetch(taskPda1);
      assert.deepEqual(taskData.status, { approved: {} });

      const claimerBalanceAfter = await provider.connection.getBalance(claimer.publicKey);
      assert.isTrue(claimerBalanceAfter > claimerBalanceBefore);
    });

    it("Should fail when non-creator approves", async () => {
      // Create another task for this test
      const title = "Another task";
      const description = "test";
      const bountyAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

      const [taskPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), boardPda.toBuffer(), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .createTask(title, description, bountyAmount)
        .accounts({
          creator: creator.publicKey,
          board: boardPda,
          task: taskPda2,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      await program.methods
        .claimTask()
        .accounts({
          claimer: claimer.publicKey,
          task: taskPda2,
        })
        .signers([claimer])
        .rpc();

      await program.methods
        .submitCompletion("proof")
        .accounts({
          claimer: claimer.publicKey,
          task: taskPda2,
        })
        .signers([claimer])
        .rpc();

      try {
        await program.methods
          .approveCompletion()
          .accounts({
            creator: otherUser.publicKey,
            task: taskPda2,
            claimer: claimer.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([otherUser])
          .rpc();
        assert.fail("Should have thrown error");
      } catch (error) {
        assert.isTrue(error.message.includes("Unauthorized"));
      }
    });
  });

  describe("Reject Completion", () => {
    it("Should successfully reject completion and return bounty", async () => {
      // Create a new task
      const title = "Rejected task";
      const description = "test";
      const bountyAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);

      const [taskPda3] = PublicKey.findProgramAddressSync(
        [Buffer.from("task"), boardPda.toBuffer(), new anchor.BN(2).toArrayLike(Buffer, "le", 8)],
        program.programId
      );

      await program.methods
        .createTask(title, description, bountyAmount)
        .accounts({
          creator: creator.publicKey,
          board: boardPda,
          task: taskPda3,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      await program.methods
        .claimTask()
        .accounts({
          claimer: claimer.publicKey,
          task: taskPda3,
        })
        .signers([claimer])
        .rpc();

      await program.methods
        .submitCompletion("bad proof")
        .accounts({
          claimer: claimer.publicKey,
          task: taskPda3,
        })
        .signers([claimer])
        .rpc();

      const creatorBalanceBefore = await provider.connection.getBalance(creator.publicKey);

      await program.methods
        .rejectCompletion()
        .accounts({
          creator: creator.publicKey,
          task: taskPda3,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([creator])
        .rpc();

      const taskData = await program.account.task.fetch(taskPda3);
      assert.deepEqual(taskData.status, { rejected: {} });

      const creatorBalanceAfter = await provider.connection.getBalance(creator.publicKey);
      // Balance should increase (bounty returned)
      assert.isTrue(creatorBalanceAfter > creatorBalanceBefore);
    });
  });
});

async function airdrop(connection: any, address: PublicKey, amount = 1000000000) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}