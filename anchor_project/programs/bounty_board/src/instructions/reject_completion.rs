use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{Task, TaskStatus};
use crate::errors::BountyError;

pub fn reject_completion_handler(ctx: Context<RejectCompletion>) -> Result<()> {
    let task = &mut ctx.accounts.task;

    if task.creator != ctx.accounts.creator.key() {
        return Err(BountyError::Unauthorized.into());
    }

    if task.status != TaskStatus::Completed {
        return Err(BountyError::InvalidTaskStatus.into());
    }

    // Return bounty to creator
    let ix = system_program::transfer(
        &system_program::CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.task.to_account_info(),
                to: ctx.accounts.creator.to_account_info(),
            },
        ),
        task.bounty_amount,
    );
    ix?;

    task.status = TaskStatus::Rejected;

    Ok(())
}

#[derive(Accounts)]
pub struct RejectCompletion<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub task: Account<'info, Task>,

    pub system_program: Program<'info, System>,
}