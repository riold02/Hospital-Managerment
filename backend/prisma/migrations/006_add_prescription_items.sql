-- ============================================================================
-- MIGRATION 004: Add prescription_items table for multiple medicines per prescription
-- Created: 2025-10-09
-- Description: Refactor prescriptions to support multiple medicines
-- ============================================================================

-- Step 1: Create prescription_items table
CREATE TABLE IF NOT EXISTS prescription_items (
    item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL,
    medicine_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_prescription FOREIGN KEY (prescription_id) 
        REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    CONSTRAINT fk_medicine FOREIGN KEY (medicine_id) 
        REFERENCES medicine(medicine_id) ON DELETE RESTRICT
);

-- Step 2: Create indexes for better performance
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine ON prescription_items(medicine_id);

-- Step 3: Migrate existing data from prescriptions to prescription_items
-- Only migrate prescriptions that have medication data
INSERT INTO prescription_items (
    prescription_id, 
    medicine_id, 
    quantity,
    dosage, 
    frequency, 
    duration,
    created_at
)
SELECT 
    p.prescription_id,
    -- Try to find medicine_id by matching medication name
    COALESCE(
        (SELECT m.medicine_id 
         FROM medicine m 
         WHERE LOWER(m.name) = LOWER(p.medication) 
         LIMIT 1),
        -- If not found, use first medicine as fallback (or skip)
        (SELECT MIN(medicine_id) FROM medicine)
    ) as medicine_id,
    1 as quantity,  -- Default quantity
    p.dosage,
    p.frequency,
    p.duration,
    p.created_at
FROM prescriptions p
WHERE p.medication IS NOT NULL 
  AND p.medication != ''
  AND EXISTS (SELECT 1 FROM medicine LIMIT 1);  -- Only if there are medicines

-- Step 4: Add new columns to prescriptions table
ALTER TABLE prescriptions 
    ADD COLUMN IF NOT EXISTS diagnosis VARCHAR(500),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 5: Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prescriptions_updated_at 
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Optional - Drop old medication columns (can be done later after verification)
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS medication;
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS dosage;
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS frequency;
-- ALTER TABLE prescriptions DROP COLUMN IF EXISTS duration;

-- Note: Keep old columns for now to allow gradual migration and rollback if needed

-- Display migration statistics
DO $$
DECLARE
    prescription_count INTEGER;
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO prescription_count FROM prescriptions;
    SELECT COUNT(*) INTO item_count FROM prescription_items;
    
    RAISE NOTICE '=== MIGRATION 004 STATISTICS ===';
    RAISE NOTICE 'Total prescriptions: %', prescription_count;
    RAISE NOTICE 'Total prescription items created: %', item_count;
    RAISE NOTICE 'Migration 004 completed successfully!';
END $$;

-- ============================================================================
-- END OF MIGRATION 004
-- ============================================================================
