use anchor_lang::prelude::*;

#[error_code]
pub enum BountyError {
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Proof too long")]
    ProofTooLong,
    #[msg("Invalid task status")]
    InvalidTaskStatus,
    #[msg("Task already claimed")]
    TaskAlreadyClaimed,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Bounty amount must be greater than 0")]
    InvalidBountyAmount,
}