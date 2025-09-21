-- ============================================================================
-- MIGRATION 006: Update to Current Database State
-- Created: 2025-09-21
-- Description: Synchronize migrations with current database state
-- Dependencies: 005_link_user_business_tables.sql
-- ============================================================================

-- ============================================================================
-- UPDATED TABLE STRUCTURES
-- ============================================================================

-- Update staff table to match current structure
ALTER TABLE staff ADD COLUMN IF NOT EXISTS employee_id VARCHAR(20) UNIQUE;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS salary DECIMAL(12,2);
ALTER TABLE staff ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure staff table has correct constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'staff_role_check' AND table_name = 'staff') THEN
        ALTER TABLE staff ADD CONSTRAINT staff_role_check 
        CHECK (role IN ('admin', 'doctor', 'nurse', 'pharmacist', 'technician', 'driver', 'worker'));
    END IF;
END $$;

-- Update departments table structure (remove email column if exists)
ALTER TABLE departments DROP COLUMN IF EXISTS email;
ALTER TABLE departments DROP COLUMN IF EXISTS phone;
ALTER TABLE departments DROP COLUMN IF EXISTS budget;
ALTER TABLE departments DROP COLUMN IF EXISTS is_active;
ALTER TABLE departments DROP COLUMN IF EXISTS created_at;
ALTER TABLE departments DROP COLUMN IF EXISTS updated_at;
ALTER TABLE departments DROP COLUMN IF EXISTS department_head_id;

-- ============================================================================
-- NEW TABLES THAT MIGHT BE MISSING
-- ============================================================================

-- Create ambulances table if not exists
CREATE TABLE IF NOT EXISTS ambulances (
    ambulance_id SERIAL PRIMARY KEY,
    ambulance_number VARCHAR(10) UNIQUE NOT NULL,
    vehicle_model VARCHAR(100),
    license_plate VARCHAR(20),
    driver_id INTEGER REFERENCES staff(staff_id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_service', 'maintenance', 'out_of_service')),
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    mileage INTEGER DEFAULT 0,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    equipment JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create ambulance_logs table if not exists
CREATE TABLE IF NOT EXISTS ambulance_logs (
    log_id SERIAL PRIMARY KEY,
    ambulance_id INTEGER NOT NULL REFERENCES ambulances(ambulance_id),
    patient_id INTEGER REFERENCES patients(patient_id),
    driver_id INTEGER NOT NULL REFERENCES staff(staff_id),
    call_time TIMESTAMPTZ NOT NULL,
    pickup_location TEXT,
    destination TEXT,
    pickup_time TIMESTAMPTZ,
    arrival_time TIMESTAMPTZ,
    priority_level VARCHAR(20) CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'en_route', 'arrived', 'transporting', 'completed', 'cancelled')),
    distance_km DECIMAL(6,2),
    fuel_consumed DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create prescription_items table if not exists
CREATE TABLE IF NOT EXISTS prescription_items (
    item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id),
    quantity INTEGER NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2)
);

-- Create pharmacy_records table if not exists
CREATE TABLE IF NOT EXISTS pharmacy_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    prescription_id INTEGER REFERENCES prescriptions(prescription_id),
    pharmacist_id INTEGER REFERENCES staff(staff_id),
    dispensed_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'dispensed' CHECK (status IN ('dispensed', 'returned', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create medical_record_medicine table if not exists
CREATE TABLE IF NOT EXISTS medical_record_medicine (
    record_id INTEGER NOT NULL REFERENCES medical_records(record_id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id),
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    prescribed_date DATE,
    PRIMARY KEY (record_id, medicine_id)
);

-- ============================================================================
-- UPDATE EXISTING TABLE STRUCTURES
-- ============================================================================

-- Update medicine table structure
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS generic_name VARCHAR(200);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(100);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS dosage_form VARCHAR(50);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS strength VARCHAR(50);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 10;
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS max_stock_level INTEGER DEFAULT 1000;
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS batch_number VARCHAR(50);
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS storage_conditions TEXT;
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE medicine ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Rename columns in medicine table if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'medicine' AND column_name = 'name') THEN
        ALTER TABLE medicine RENAME COLUMN name TO medicine_name;
    END IF;
END $$;

-- Update prescriptions table structure
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled'));
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update rooms table structure
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_number INTEGER;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS building VARCHAR(50);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS current_occupancy INTEGER DEFAULT 0;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2);
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS equipment JSONB;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_cleaned TIMESTAMPTZ;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update appointments table structure
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type VARCHAR(50);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update appointment status constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'appointments_status_check' AND table_name = 'appointments') THEN
        ALTER TABLE appointments ADD CONSTRAINT appointments_status_check 
        CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'));
    END IF;
END $$;

-- Update medical_records table structure
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS vital_signs JSONB;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS lab_results JSONB;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update billing table structure
ALTER TABLE billing ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE billing ADD COLUMN IF NOT EXISTS insurance_claim_amount DECIMAL(12,2) DEFAULT 0;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;

-- Update billing payment_status constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'billing_payment_status_check' AND table_name = 'billing') THEN
        ALTER TABLE billing ADD CONSTRAINT billing_payment_status_check 
        CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled'));
    END IF;
END $$;

-- ============================================================================
-- CREATE MISSING INDEXES
-- ============================================================================

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_employee_id ON staff(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

-- Ambulance indexes
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_driver_id ON ambulances(driver_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_ambulance_id ON ambulance_logs(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_patient_id ON ambulance_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_driver_id ON ambulance_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_call_time ON ambulance_logs(call_time);

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_medicine_id ON prescription_items(medicine_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescription_date ON prescriptions(prescription_date);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_patient_id ON pharmacy_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_prescription_id ON pharmacy_records(prescription_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_pharmacist_id ON pharmacy_records(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_dispensed_date ON pharmacy_records(dispensed_date);

-- Medicine indexes
CREATE INDEX IF NOT EXISTS idx_medicine_category ON medicine(category);
CREATE INDEX IF NOT EXISTS idx_medicine_expiry_date ON medicine(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medicine_is_active ON medicine(is_active);

-- ============================================================================
-- UPDATE TRIGGERS
-- ============================================================================

-- Update triggers for new tables
CREATE TRIGGER IF NOT EXISTS update_ambulances_updated_at 
    BEFORE UPDATE ON ambulances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_medicine_updated_at 
    BEFORE UPDATE ON medicine 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_rooms_updated_at 
    BEFORE UPDATE ON rooms 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DATA MIGRATIONS
-- ============================================================================

-- Ensure all staff have employee_id
UPDATE staff SET employee_id = 'EMP' || staff_id || '-' || EXTRACT(epoch FROM NOW())::bigint 
WHERE employee_id IS NULL;

-- Ensure all medicine have proper naming
UPDATE medicine SET medicine_name = name WHERE medicine_name IS NULL AND name IS NOT NULL;

-- ============================================================================
-- FINAL VALIDATIONS
-- ============================================================================

-- Validate core table relationships
DO $$
BEGIN
    -- Check if all required tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Missing required table: users';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        RAISE EXCEPTION 'Missing required table: roles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        RAISE EXCEPTION 'Missing required table: permissions';
    END IF;
    
    RAISE NOTICE 'Migration 006 completed successfully!';
END $$;