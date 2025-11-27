use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{Task, TaskStatus};
use crate::errors::BountyError;

pub fn approve_completion_handler(ctx: Context<ApproveCompletion>) -> Result<()> {
    let task = &mut ctx.accounts.task;

    if task.creator != ctx.accounts.creator.key() {
        return Err(BountyError::Unauthorized.into());
    }

    if task.status != TaskStatus::Completed {
        return Err(BountyError::InvalidTaskStatus.into());
    }

    let claimer_key = task.claimer.ok_or(BountyError::Unauthorized)?;

    // Transfer bounty from task account to claimer
    let ix = system_program::transfer(
        &system_program::CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.task.to_account_info(),
                to: ctx.accounts.claimer.to_account_info(),
            },
        ),
        task.bounty_amount,
    );
    ix?;

    task.status = TaskStatus::Approved;

    Ok(())
}

#[derive(Accounts)]
pub struct ApproveCompletion<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub task: Account<'info, Task>,

    /// CHECK: Claimer account (receives funds)
    #[account(mut)]
    pub claimer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}