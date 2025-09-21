-- Migration: Add password reset tokens table for forgot password functionality
-- Version: 2.4.0
-- Date: 2025-09-09
-- Description: Creates password_reset_tokens table to handle secure password reset workflow

-- ============================================================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================================================

-- Create password_reset_tokens table
CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,  -- Hashed reset token for security
    expires_at TIMESTAMPTZ NOT NULL,   -- Token expiration (15-30 minutes typical)
    used_at TIMESTAMPTZ NULL,          -- When token was used (NULL = not used yet)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint to users table
ALTER TABLE password_reset_tokens
ADD CONSTRAINT fk_password_reset_tokens_user_id
FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ============================================================================
-- CLEANUP EXPIRED TOKENS FUNCTION
-- ============================================================================

-- Function to clean up expired tokens (should be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE password_reset_tokens IS 'Stores secure tokens for password reset functionality';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'Hashed version of reset token sent via email';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration timestamp (typically 15-30 minutes)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used (NULL = unused)';

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

-- IMPORTANT SECURITY CONSIDERATIONS:
-- 1. Never store plain text tokens in database - always hash them
-- 2. Tokens should expire within 15-30 minutes for security
-- 3. Tokens should be single-use (mark used_at when consumed)
-- 4. Clean up expired/used tokens regularly
-- 5. Rate limit password reset requests per email/IP
-- 6. Log password reset attempts for security monitoring

COMMIT;
