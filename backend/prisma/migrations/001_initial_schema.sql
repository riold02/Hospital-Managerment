-- ============================================================================
-- MIGRATION 001: Initial Hospital Management System Schema
-- Created: 2025-09-21 (Complete Optimized Version)
-- Description: Complete initial database schema with all core tables and relationships
-- Dependencies: None
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- USER AUTHENTICATION TABLES
-- ============================================================================

-- Users table (central authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens table (from migration 004)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to clean up expired tokens (from migration 004)
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
-- CORE ORGANIZATIONAL TABLES
-- ============================================================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    head_doctor_id INTEGER,
    location VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
    room_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    base_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type_id INTEGER REFERENCES room_types(room_type_id),
    department_id INTEGER REFERENCES departments(department_id),
    capacity INTEGER DEFAULT 1 CHECK (capacity > 0),
    current_occupancy INTEGER DEFAULT 0 CHECK (current_occupancy >= 0),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
    floor_number INTEGER,
    building VARCHAR(50),
    daily_rate DECIMAL(10,2),
    equipment JSONB,
    last_cleaned TIMESTAMPTZ,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_occupancy_capacity CHECK (current_occupancy <= capacity)
);

-- ============================================================================
-- STAFF AND PERSONNEL TABLES
-- ============================================================================

-- Staff
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    position VARCHAR(100),
    department_id INTEGER REFERENCES departments(department_id) ON DELETE SET NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    hire_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctors (Extended staff information) 
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id SERIAL PRIMARY KEY,
    staff_id INTEGER UNIQUE REFERENCES staff(staff_id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    available_schedule TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Department mapping (Many-to-many)
CREATE TABLE IF NOT EXISTS doctor_department (
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    department_id INTEGER NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_id, department_id)
);

-- ============================================================================
-- PATIENT MANAGEMENT TABLES
-- ============================================================================

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    patient_code VARCHAR(20) NOT NULL UNIQUE,
    user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE SET NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(5) CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    allergies TEXT,
    medical_history TEXT,
    insurance_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MEDICAL MANAGEMENT TABLES
-- ============================================================================

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    purpose VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'Cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    appointment_id INTEGER REFERENCES appointments(appointment_id) ON DELETE NO ACTION,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MEDICINE AND PHARMACY TABLES
-- ============================================================================

-- Medicine
CREATE TABLE IF NOT EXISTS medicine (
    medicine_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    type VARCHAR(20),
    dosage VARCHAR(50),
    medicine_name VARCHAR(200),
    generic_name VARCHAR(200),
    manufacturer VARCHAR(100),
    category VARCHAR(100),
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    unit_price DECIMAL(10,2) CHECK (unit_price >= 0),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    min_stock_level INTEGER DEFAULT 10 CHECK (min_stock_level >= 0),
    max_stock_level INTEGER DEFAULT 1000 CHECK (max_stock_level >= min_stock_level),
    expiry_date DATE,
    batch_number VARCHAR(50),
    storage_conditions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    prescribed_by INTEGER NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    prescribed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    medical_record_id INTEGER REFERENCES medical_records(record_id) ON DELETE SET NULL,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    medication VARCHAR(100),
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Filled', 'Partially_Filled', 'Cancelled', 'Expired')),
    total_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Medical Record Medicine (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS medical_record_medicine (
    record_id INTEGER NOT NULL REFERENCES medical_records(record_id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id) ON DELETE CASCADE,
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    prescribed_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (record_id, medicine_id)
);

-- ============================================================================
-- OPERATIONAL TABLES
-- ============================================================================

-- Room Assignments
CREATE TABLE IF NOT EXISTS room_assignments (
    assignment_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(patient_id) ON DELETE SET NULL,
    staff_id INTEGER REFERENCES staff(staff_id) ON DELETE SET NULL,
    assigned_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('patient', 'staff')),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either patient_id or staff_id is provided based on assignment_type
    CONSTRAINT chk_assignment_type_patient CHECK (
        (assignment_type = 'patient' AND patient_id IS NOT NULL AND staff_id IS NULL) OR
        (assignment_type = 'staff' AND staff_id IS NOT NULL AND patient_id IS NULL)
    ),
    -- Prevent overlapping active assignments for same room
    EXCLUDE USING gist (room_id WITH =, daterange(start_date, COALESCE(end_date, 'infinity'::date)) WITH &&) 
    WHERE (status = 'active')
);

-- Billing
CREATE TABLE IF NOT EXISTS billing (
    bill_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    appointment_id INTEGER REFERENCES appointments(appointment_id) ON DELETE NO ACTION,
    processed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    payment_date TIMESTAMPTZ,
    insurance_provider VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy Records (Original structure)
CREATE TABLE IF NOT EXISTS pharmacy_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    prescription_id INTEGER REFERENCES prescriptions(prescription_id) ON DELETE SET NULL,
    pharmacist_id INTEGER REFERENCES staff(staff_id) ON DELETE SET NULL,
    dispensed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'dispensed' CHECK (status IN ('dispensed', 'returned', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy (Schema structure)
CREATE TABLE IF NOT EXISTS pharmacy (
    pharmacy_id SERIAL PRIMARY KEY,
    medicine_id INTEGER REFERENCES medicine(medicine_id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
    dispensed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    quantity INTEGER,
    prescription_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMERGENCY AND TRANSPORT TABLES
-- ============================================================================

-- Ambulance (singular to match Prisma schema)
CREATE TABLE IF NOT EXISTS ambulance (
    ambulance_id SERIAL PRIMARY KEY,
    ambulance_number VARCHAR(10) UNIQUE,
    availability VARCHAR(15),
    driver_id INTEGER,
    driver_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    last_service_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ambulance Logs (Using schema naming: ambulance_log)
CREATE TABLE IF NOT EXISTS ambulance_log (
    log_id SERIAL PRIMARY KEY,
    ambulance_id INTEGER REFERENCES ambulance(ambulance_id) ON DELETE CASCADE,
    patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
    pickup_location VARCHAR(100),
    dropoff_location VARCHAR(100),
    pickup_time TIMESTAMPTZ,
    dropoff_time TIMESTAMPTZ,
    status VARCHAR(15),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MAINTENANCE AND CLEANING TABLES
-- ============================================================================

-- Cleaning Service
CREATE TABLE IF NOT EXISTS cleaning_service (
    cleaning_id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(room_id),
    cleaning_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cleaning_type VARCHAR(50),
    cleaned_by INTEGER REFERENCES staff(staff_id),
    cleaned_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Completed',
    notes VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Department indexes
CREATE INDEX IF NOT EXISTS idx_departments_head_doctor_id ON departments(head_doctor_id);

-- Room indexes
CREATE INDEX IF NOT EXISTS idx_rooms_type_id ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_department_id ON rooms(department_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_floor_building ON rooms(floor_number, building);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Password reset tokens indexes (from migration 004)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);

-- Doctor indexes
CREATE INDEX IF NOT EXISTS idx_doctors_staff_id ON doctors(staff_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);

-- Patient indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients(is_active);
CREATE INDEX IF NOT EXISTS idx_patients_blood_type ON patients(blood_type);

-- Appointment indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_date, appointment_time);

-- Medical Record indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_by_user_id ON medical_records(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_appointment_id ON medical_records(appointment_id);

-- Medicine indexes
CREATE INDEX IF NOT EXISTS idx_medicine_is_active ON medicine(is_active);
CREATE INDEX IF NOT EXISTS idx_medicine_category ON medicine(category);
CREATE INDEX IF NOT EXISTS idx_medicine_expiry_date ON medicine(expiry_date);
CREATE INDEX IF NOT EXISTS idx_medicine_stock_level ON medicine(stock_quantity, min_stock_level);

-- Prescription indexes
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescribed_by ON prescriptions(prescribed_by);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescribed_by_user_id ON prescriptions(prescribed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_date ON prescriptions(prescription_date);

-- Prescription Items indexes
CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX IF NOT EXISTS idx_prescription_items_medicine_id ON prescription_items(medicine_id);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_processed_by_user_id ON billing(processed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_payment_date ON billing(payment_date);

-- Pharmacy Record indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_patient_id ON pharmacy_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_prescription_id ON pharmacy_records(prescription_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_pharmacist_id ON pharmacy_records(pharmacist_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_dispensed_date ON pharmacy_records(dispensed_date);

-- Pharmacy indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensed_by_user_id ON pharmacy(dispensed_by_user_id);

-- Room Assignment indexes
CREATE INDEX IF NOT EXISTS idx_room_assignments_room_id ON room_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_patient_id ON room_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_staff_id ON room_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_assigned_by_user_id ON room_assignments(assigned_by_user_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_status ON room_assignments(status);
CREATE INDEX IF NOT EXISTS idx_room_assignments_dates ON room_assignments(start_date, end_date);

-- Ambulance indexes
CREATE INDEX IF NOT EXISTS idx_ambulance_availability ON ambulance(availability);
CREATE INDEX IF NOT EXISTS idx_ambulance_driver_id ON ambulance(driver_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_driver_user_id ON ambulance(driver_user_id);

-- Ambulance Log indexes
CREATE INDEX IF NOT EXISTS idx_ambulance_log_ambulance_id ON ambulance_log(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_log_patient_id ON ambulance_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_log_pickup_time ON ambulance_log(pickup_time);
CREATE INDEX IF NOT EXISTS idx_ambulance_log_status ON ambulance_log(status);

-- Cleaning Service indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_service_room_id ON cleaning_service(room_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_cleaned_by ON cleaning_service(cleaned_by);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_cleaned_by_user_id ON cleaning_service(cleaned_by_user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_date ON cleaning_service(cleaning_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_status ON cleaning_service(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON room_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medicine_updated_at BEFORE UPDATE ON medicine FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_assignments_updated_at BEFORE UPDATE ON room_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacy_records_updated_at BEFORE UPDATE ON pharmacy_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pharmacy_updated_at BEFORE UPDATE ON pharmacy FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ambulance_updated_at BEFORE UPDATE ON ambulance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ambulance_log_updated_at BEFORE UPDATE ON ambulance_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cleaning_service_updated_at BEFORE UPDATE ON cleaning_service FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE departments IS 'Hospital departments and their basic information';
COMMENT ON TABLE room_types IS 'Types of rooms available in the hospital';
COMMENT ON TABLE rooms IS 'Individual rooms with their current status and capacity';
COMMENT ON TABLE staff IS 'Hospital staff members including doctors, nurses, and other personnel';
COMMENT ON TABLE doctors IS 'Extended information for medical doctors';
COMMENT ON TABLE patients IS 'Patient registration and basic information';
COMMENT ON TABLE appointments IS 'Scheduled appointments between patients and doctors';
COMMENT ON TABLE medical_records IS 'Patient medical records and visit history';
COMMENT ON TABLE medicine IS 'Medicine inventory and information';
COMMENT ON TABLE prescriptions IS 'Prescriptions issued by doctors';
COMMENT ON TABLE prescription_items IS 'Individual medicines in prescriptions';
COMMENT ON TABLE room_assignments IS 'Room assignments for patients and staff';
COMMENT ON TABLE billing IS 'Patient billing and payment records';
COMMENT ON TABLE pharmacy_records IS 'Medicine dispensing records';
COMMENT ON TABLE ambulance IS 'Ambulance fleet information';
COMMENT ON TABLE ambulance_log IS 'Ambulance service call logs';
COMMENT ON TABLE cleaning_service IS 'Room cleaning and maintenance records';

-- ============================================================================
-- END OF MIGRATION 001
-- ============================================================================

-- Validation
DO $$
BEGIN
    RAISE NOTICE 'Migration 001 completed successfully!';
    RAISE NOTICE 'Tables created: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public');
END $$;
