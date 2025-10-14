-- ============================================================================
-- MIGRATION 004: Add payment_method to billing table
-- Created: 2025-10-10
-- Description: Add payment method field to track cash or transfer payments
-- ============================================================================

-- Add payment_method column to billing table
ALTER TABLE billing 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN billing.payment_method IS 'Payment method: CASH (Tiền mặt) or TRANSFER (Chuyển khoản)';

-- Display confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 004 completed: payment_method field added to billing table';
END $$;
