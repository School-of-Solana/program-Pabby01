# Project Description

**Deployed Frontend URL:** [https://bounty-board.vercel.app](https://bounty-board.vercel.app)

**Solana Program ID:** `11111111111111111111111111111111` (Deploy on Devnet)

## Project Overview

### Description
A decentralized task bounty board built on Solana that connects task creators with freelancers. Users can post tasks with SOL bounties, freelancers can claim and complete them, and creators approve or reject work with automatic SOL transfers. This platform demonstrates core Solana programming concepts including PDAs, state management, and secure fund handling through program-controlled accounts.

### Key Features
- **Post Tasks**: Create tasks with custom titles, descriptions, and SOL bounties (locked in program account)
- **Browse & Filter**: Filter tasks by status (Open, In Progress, Completed, Approved, Rejected)
- **Claim Tasks**: Freelancers claim available tasks (only one claimer per task)
- **Submit Work**: Claimers submit proof of completion (GitHub links, portfolio URLs, etc.)
- **Approve/Reject**: Task creators review work and approve (transfer bounty) or reject (return bounty)
- **My Tasks Dashboard**: View tasks you've created or claimed with status updates

### How to Use the dApp
1. **Connect Wallet** - Click "Connect Wallet" and select Phantom or Solflare
2. **Post Task** - Go to "Post Task" tab, fill in title/description/bounty amount (min 0.1 SOL)
3. **Browse Tasks** - Browse all tasks on "Browse Tasks" page, filtered by status
4. **Claim Task** - Click on a task and claim it (you become the worker)
5. **Submit Work** - Submit proof of completion (GitHub repo, portfolio link, etc.)
6. **Creator Review** - Task creator approves (bounty transfers to you) or rejects (bounty returns to them)
7. **Check Status** - View all your tasks on "My Tasks" dashboard

## Program Architecture
The BountyBoard program uses a decentralized state management model where each task is its own account holding the bounty SOL. This ensures atomic fund transfers and prevents double-spending.

### PDA Usage
Program Derived Addresses create deterministic, unique accounts for the board and each task.

**PDAs Used:**
- **Board PDA**: `[b"bounty_board", authority_pubkey]` - Global board tracking task count and total bounties. Authority is the program admin.
- **Task PDA**: `[b"task", board_pubkey, task_id]` - Individual task accounts holding the bounty SOL. Each task is a unique account with its own lamports.

### Program Instructions

**Instructions Implemented:**
- **initialize_board** - Creates the global board account (only authority can call)
- **create_task** - Posts a new task, transfers bounty SOL from creator to task account, increments task counter
- **claim_task** - Freelancer claims task (changes status from Created to Claimed)
- **submit_completion** - Claimer submits proof of work (changes status to Completed)
- **approve_completion** - Creator approves work, transfers bounty from task account to claimer
- **reject_completion** - Creator rejects work, transfers bounty back to creator account

### Account Structure

```rust
#[account]
pub struct BountyBoard {
    pub authority: Pubkey,        // Program admin
    pub task_count: u64,          // Total tasks created
    pub total_bounties: u64,      // Total SOL locked in bounties
    pub bump: u8,                 // PDA bump seed
}

#[account]
pub struct Task {
    pub creator: Pubkey,          // Task poster
    pub claimer: Option<Pubkey>,  // Freelancer working on task
    pub title: String,            // Task title (max 100 chars)
    pub description: String,      // Task description (max 500 chars)
    pub bounty_amount: u64,       // Bounty in lamports (stored in account as balance)
    pub status: TaskStatus,       // Created, Claimed, Completed, Approved, Rejected
    pub proof: String,            // Work submission proof (max 500 chars)
    pub task_id: u64,             // Unique task ID
    pub bump: u8,                 // PDA bump seed
}

pub enum TaskStatus {
    Created,     // Available to claim
    Claimed,     // Claimed but not completed
    Completed,   // Submitted for review
    Approved,    // Approved by creator, funds transferred
    Rejected,    // Rejected by creator, funds returned
}
```

## Testing

### Test Coverage
Comprehensive test suite covering all instructions with both successful operations and error conditions.

**Happy Path Tests:**
- **Initialize Board**: Successfully creates board with correct authority
- **Create Task**: Posts task with correct PDA, transfers bounty SOL, increments counter
- **Claim Task**: Claimer successfully claims task, status changes to Claimed
- **Submit Completion**: Claimer submits proof, status changes to Completed
- **Approve Completion**: Creator approves, bounty transfers to claimer, status is Approved
- **Reject Completion**: Creator rejects, bounty returns to creator, status is Rejected

**Unhappy Path Tests:**
- **Create Task - Title Too Long**: Fails with "TitleTooLong" error
- **Create Task - Zero Bounty**: Fails with "InvalidBountyAmount" error
- **Claim Already Claimed**: Fails with "TaskAlreadyClaimed" error
- **Submit - Wrong Status**: Fails when task not in Claimed state
- **Submit - Non-Claimer**: Fails when non-claimer tries to submit
- **Approve - Non-Creator**: Fails when non-creator tries to approve
- **Approve - Wrong Status**: Fails when task not in Completed state

### Running Tests
```bash
cd anchor_project
yarn install
anchor build
anchor test
```

### Additional Notes for Evaluators

**Architecture Highlights:**
- **Rent-Exempt Design**: All task accounts are rent-exempt, preventing accidental deletion
- **Fund Safety**: Bounties locked in task accounts, only transfer on explicit approval/rejection
- **PDA Determinism**: Same user+task_id always derives same PDA, enabling idempotent operations
- **Status Machine**: State transitions are enforced (Created→Claimed→Completed→Approved/Rejected)

**Frontend Features:**
- Real-time wallet connection via Phantom/Solflare
- Responsive design (mobile-friendly)
- Filter tasks by status
- Dashboard for personal tasks
- Form validation (title/description length, min bounty)

**Future Enhancements:**
- Dispute resolution system (3rd party arbitration)
- Reputation/rating system for creators & workers
- Escrow for partial payments (milestone-based)
- Task categories & search functionality
- Notification system for task updates
- Multi-sig task approval for teams

**Lessons Learned:**
- PDAs significantly simplify account management compared to manual keypairs
- Fund transfers in Solana require explicit CPI calls to system program
- Account state should reflect complete workflow (status enum is essential)
- Testing fund transfers requires careful tracking of account balances

Made with ❤️ on Solana