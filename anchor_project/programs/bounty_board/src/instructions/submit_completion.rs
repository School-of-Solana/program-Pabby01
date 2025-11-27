use anchor_lang::prelude::*;
use crate::state::{Task, TaskStatus, PROOF_MAX_LEN};
use crate::errors::BountyError;

pub fn submit_completion_handler(ctx: Context<SubmitCompletion>, proof: String) -> Result<()> {
    if proof.len() > PROOF_MAX_LEN {
        return Err(BountyError::ProofTooLong.into());
    }

    let task = &mut ctx.accounts.task;

    if task.status != TaskStatus::Claimed {
        return Err(BountyError::InvalidTaskStatus.into());
    }

    if task.claimer != Some(ctx.accounts.claimer.key()) {
        return Err(BountyError::Unauthorized.into());
    }

    task.proof = proof;
    task.status = TaskStatus::Completed;

    Ok(())
}

#[derive(Accounts)]
pub struct SubmitCompletion<'info> {
    #[account(mut)]
    pub claimer: Signer<'info>,

    #[account(mut)]
    pub task: Account<'info, Task>,
}