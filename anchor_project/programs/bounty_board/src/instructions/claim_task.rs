use anchor_lang::prelude::*;
use crate::state::{Task, TaskStatus};
use crate::errors::BountyError;

pub fn claim_task_handler(ctx: Context<ClaimTask>) -> Result<()> {
    let task = &mut ctx.accounts.task;

    if task.status != TaskStatus::Created {
        return Err(BountyError::TaskAlreadyClaimed.into());
    }

    task.claimer = Some(ctx.accounts.claimer.key());
    task.status = TaskStatus::Claimed;

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimTask<'info> {
    #[account(mut)]
    pub claimer: Signer<'info>,

    #[account(mut)]
    pub task: Account<'info, Task>,
}