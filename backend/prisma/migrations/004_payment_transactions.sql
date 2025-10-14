-- ============================================================================
-- MIGRATION 004: Payment Transactions Table
-- Created: 2025-10-10
-- Description: Add payment_transactions table for tracking online payments
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL,
    payment_gateway VARCHAR(20) NOT NULL, -- 'MOMO', 'VNPAY', 'CASH'
    transaction_code VARCHAR(100) UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'
    payment_url TEXT,
    gateway_transaction_id VARCHAR(100),
    gateway_response JSONB,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bill FOREIGN KEY (bill_id) REFERENCES billing(bill_id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_transactions_bill ON payment_transactions(bill_id);
CREATE INDEX idx_payment_transactions_code ON payment_transactions(transaction_code);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- Add payment_method column to billing table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'billing' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE billing ADD COLUMN payment_method VARCHAR(20);
    END IF;
END $$;

COMMENT ON TABLE payment_transactions IS 'Tracks online payment transactions through MOMO, VNPAY gateways';
COMMENT ON COLUMN payment_transactions.payment_gateway IS 'Payment gateway used: MOMO, VNPAY, CASH';
COMMENT ON COLUMN payment_transactions.transaction_code IS 'Unique transaction code for tracking';
COMMENT ON COLUMN payment_transactions.gateway_response IS 'Full response from payment gateway in JSON format';

-- Migration complete
DO $$
BEGIN
    RAISE NOTICE 'Migration 004 (Payment Transactions) completed successfully!';
END $$;
