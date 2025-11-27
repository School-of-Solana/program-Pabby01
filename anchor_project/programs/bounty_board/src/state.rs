use anchor_lang::prelude::*;

pub const BOARD_SEED: &[u8] = b"bounty_board";
pub const TASK_SEED: &[u8] = b"task";
pub const TITLE_MAX_LEN: usize = 100;
pub const DESCRIPTION_MAX_LEN: usize = 500;
pub const PROOF_MAX_LEN: usize = 500;

#[account]
#[derive(InitSpace)]
pub struct BountyBoard {
    pub authority: Pubkey,
    pub task_count: u64,
    pub total_bounties: u64,
    pub bump: u8,
}

#[derive(Clone, Copy, PartialEq, AnchorDeserialize, AnchorSerialize)]
pub enum TaskStatus {
    Created = 0,
    Claimed = 1,
    Completed = 2,
    Approved = 3,
    Rejected = 4,
}

#[account]
#[derive(InitSpace)]
pub struct Task {
    pub creator: Pubkey,
    pub claimer: Option<Pubkey>,
    #[max_len(TITLE_MAX_LEN)]
    pub title: String,
    #[max_len(DESCRIPTION_MAX_LEN)]
    pub description: String,
    pub bounty_amount: u64,
    pub status: TaskStatus,
    #[max_len(PROOF_MAX_LEN)]
    pub proof: String,
    pub task_id: u64,
    pub bump: u8,
}