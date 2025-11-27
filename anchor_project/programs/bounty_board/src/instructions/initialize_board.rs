use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::{BountyBoard, BOARD_SEED};

pub fn initialize_board_handler(ctx: Context<InitializeBoard>) -> Result<()> {
    let board = &mut ctx.accounts.board;
    board.authority = ctx.accounts.authority.key();
    board.task_count = 0;
    board.total_bounties = 0;
    board.bump = ctx.bumps.board;
    Ok(())
}

#[derive(Accounts)]
pub struct InitializeBoard<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + BountyBoard::INIT_SPACE,
        seeds = [BOARD_SEED, authority.key().as_ref()],
        bump
    )]
    pub board: Account<'info, BountyBoard>,

    pub system_program: Program<'info, System>,
}