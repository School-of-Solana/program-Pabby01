use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;

use instructions::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod bounty_board {
    use super::*;

    pub fn initialize_board(ctx: Context<InitializeBoard>) -> Result<()> {
        initialize_board_handler(ctx)
    }

    pub fn create_task(ctx: Context<CreateTask>, title: String, description: String, bounty_amount: u64) -> Result<()> {
        create_task_handler(ctx, title, description, bounty_amount)
    }

    pub fn claim_task(ctx: Context<ClaimTask>) -> Result<()> {
        claim_task_handler(ctx)
    }

    pub fn submit_completion(ctx: Context<SubmitCompletion>, proof: String) -> Result<()> {
        submit_completion_handler(ctx, proof)
    }

    pub fn approve_completion(ctx: Context<ApproveCompletion>) -> Result<()> {
        approve_completion_handler(ctx)
    }

    pub fn reject_completion(ctx: Context<RejectCompletion>) -> Result<()> {
        reject_completion_handler(ctx)
    }
}