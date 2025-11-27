use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{Task, BountyBoard, TaskStatus, TASK_SEED, TITLE_MAX_LEN, DESCRIPTION_MAX_LEN};
use crate::errors::BountyError;

pub fn create_task_handler(
    ctx: Context<CreateTask>,
    title: String,
    description: String,
    bounty_amount: u64,
) -> Result<()> {
    if title.len() > TITLE_MAX_LEN {
        return Err(BountyError::TitleTooLong.into());
    }
    if description.len() > DESCRIPTION_MAX_LEN {
        return Err(BountyError::DescriptionTooLong.into());
    }
    if bounty_amount == 0 {
        return Err(BountyError::InvalidBountyAmount.into());
    }

    let board = &mut ctx.accounts.board;
    let task = &mut ctx.accounts.task;

    task.creator = ctx.accounts.creator.key();
    task.claimer = None;
    task.title = title;
    task.description = description;
    task.bounty_amount = bounty_amount;
    task.status = TaskStatus::Created;
    task.proof = String::new();
    task.task_id = board.task_count;
    task.bump = ctx.bumps.task;

    board.task_count += 1;
    board.total_bounties += bounty_amount;

    // Transfer SOL from creator to task account (bounty locked)
    let ix = system_program::transfer(
        &system_program::CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.creator.to_account_info(),
                to: ctx.accounts.task.to_account_info(),
            },
        ),
        bounty_amount,
    );
    ix?;

    Ok(())
}

#[derive(Accounts)]
pub struct CreateTask<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(mut)]
    pub board: Account<'info, BountyBoard>,

    #[account(
        init,
        payer = creator,
        space = 8 + Task::INIT_SPACE,
        seeds = [TASK_SEED, board.key().as_ref(), &board.task_count.to_le_bytes()],
        bump
    )]
    pub task: Account<'info, Task>,

    pub system_program: Program<'info, System>,
}