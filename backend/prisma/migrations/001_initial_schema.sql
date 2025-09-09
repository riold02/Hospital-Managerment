-- ============================================================================
-- MIGRATION 001: Initial Hospital Management System Schema
-- Created: 2025-09-09
-- Description: Initial database schema with all core tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    head_doctor_id INTEGER,
    location VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Types
CREATE TABLE IF NOT EXISTS room_types (
    room_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE,
    room_type_id INTEGER REFERENCES room_types(room_type_id),
    department_id INTEGER REFERENCES departments(department_id),
    capacity INTEGER DEFAULT 1,
    current_occupancy INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'cleaning')),
    floor_number INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'pharmacist', 'technician', 'driver', 'worker')),
    position VARCHAR(100),
    department_id INTEGER REFERENCES departments(department_id),
    hire_date DATE,
    salary DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients
CREATE TABLE IF NOT EXISTS patients (
    patient_id SERIAL PRIMARY KEY,
    patient_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    insurance_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors (Extended staff information)
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id SERIAL PRIMARY KEY,
    staff_id INTEGER NOT NULL REFERENCES staff(staff_id),
    specialization VARCHAR(100),
    license_number VARCHAR(50) UNIQUE,
    years_of_experience INTEGER,
    education TEXT,
    consultation_fee DECIMAL(10,2),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MEDICAL MANAGEMENT TABLES
-- ============================================================================

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 30, -- minutes
    reason TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Records
CREATE TABLE IF NOT EXISTS medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER REFERENCES doctors(doctor_id),
    appointment_id INTEGER REFERENCES appointments(appointment_id),
    visit_date DATE NOT NULL,
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    vital_signs JSONB,
    lab_results JSONB,
    notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicine
CREATE TABLE IF NOT EXISTS medicine (
    medicine_id SERIAL PRIMARY KEY,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    manufacturer VARCHAR(100),
    category VARCHAR(100),
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock_level INTEGER DEFAULT 10,
    expiry_date DATE,
    batch_number VARCHAR(50),
    storage_conditions TEXT,
    side_effects TEXT,
    contraindications TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(doctor_id),
    medical_record_id INTEGER REFERENCES medical_records(record_id),
    prescription_date DATE NOT NULL,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'partially_dispensed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items
CREATE TABLE IF NOT EXISTS prescription_items (
    prescription_item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id),
    medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id),
    quantity INTEGER NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medical Record Medicine (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS medical_record_medicine (
    medical_record_id INTEGER REFERENCES medical_records(record_id),
    medicine_id INTEGER REFERENCES medicine(medicine_id),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (medical_record_id, medicine_id)
);

-- ============================================================================
-- OPERATIONAL TABLES
-- ============================================================================

-- Room Assignments
CREATE TABLE IF NOT EXISTS room_assignments (
    assignment_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(room_id),
    patient_id INTEGER REFERENCES patients(patient_id),
    staff_id INTEGER REFERENCES staff(staff_id),
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('patient', 'staff')),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing
CREATE TABLE IF NOT EXISTS billing (
    billing_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    appointment_id INTEGER REFERENCES appointments(appointment_id),
    billing_date DATE NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    insurance_claim_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pharmacy Records
CREATE TABLE IF NOT EXISTS pharmacy_records (
    pharmacy_record_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(prescription_id),
    medicine_id INTEGER NOT NULL REFERENCES medicine(medicine_id),
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    pharmacist_id INTEGER NOT NULL REFERENCES staff(staff_id),
    quantity_dispensed INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    dispensed_date DATE NOT NULL,
    batch_number VARCHAR(50),
    expiry_date DATE,
    instructions TEXT,
    status VARCHAR(20) DEFAULT 'dispensed' CHECK (status IN ('dispensed', 'returned', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambulances
CREATE TABLE IF NOT EXISTS ambulances (
    ambulance_id SERIAL PRIMARY KEY,
    vehicle_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50),
    capacity INTEGER DEFAULT 2,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service')),
    driver_id INTEGER REFERENCES staff(staff_id),
    location VARCHAR(200),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    mileage INTEGER,
    equipment_list TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ambulance Logs
CREATE TABLE IF NOT EXISTS ambulance_logs (
    log_id SERIAL PRIMARY KEY,
    ambulance_id INTEGER NOT NULL REFERENCES ambulances(ambulance_id),
    driver_id INTEGER NOT NULL REFERENCES staff(staff_id),
    patient_id INTEGER REFERENCES patients(patient_id),
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP,
    pickup_location VARCHAR(200),
    destination VARCHAR(200),
    distance_km DECIMAL(8,2),
    fuel_used DECIMAL(8,2),
    emergency_type VARCHAR(100),
    priority_level VARCHAR(20) CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('dispatched', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleaning Service
CREATE TABLE IF NOT EXISTS cleaning_service (
    cleaning_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES rooms(room_id),
    staff_id INTEGER NOT NULL REFERENCES staff(staff_id),
    cleaning_date DATE NOT NULL,
    cleaning_time TIME NOT NULL,
    cleaning_type VARCHAR(50) NOT NULL CHECK (cleaning_type IN ('daily', 'deep', 'disinfection', 'maintenance')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    duration_minutes INTEGER,
    supplies_used TEXT,
    notes TEXT,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Medical Records indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_visit_date ON medical_records(visit_date);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_billing_patient_id ON billing(patient_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_date ON billing(billing_date);

-- Pharmacy Records indexes
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_prescription_id ON pharmacy_records(prescription_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_patient_id ON pharmacy_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_records_medicine_id ON pharmacy_records(medicine_id);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);

-- Patients indexes
CREATE INDEX IF NOT EXISTS idx_patients_is_active ON patients(is_active);

-- Medicine indexes
CREATE INDEX IF NOT EXISTS idx_medicine_is_active ON medicine(is_active);
CREATE INDEX IF NOT EXISTS idx_medicine_stock ON medicine(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_medicine_expiry ON medicine(expiry_date);

-- Room assignments indexes
CREATE INDEX IF NOT EXISTS idx_room_assignments_room_id ON room_assignments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_patient_id ON room_assignments(patient_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_status ON room_assignments(status);

-- Ambulance logs indexes
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_ambulance_id ON ambulance_logs(ambulance_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_departure_time ON ambulance_logs(departure_time);
CREATE INDEX IF NOT EXISTS idx_ambulance_logs_status ON ambulance_logs(status);

-- Cleaning service indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_service_room_id ON cleaning_service(room_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_staff_id ON cleaning_service(staff_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_date ON cleaning_service(cleaning_date);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
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
CREATE TRIGGER update_ambulances_updated_at BEFORE UPDATE ON ambulances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ambulance_logs_updated_at BEFORE UPDATE ON ambulance_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cleaning_service_updated_at BEFORE UPDATE ON cleaning_service FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF MIGRATION 001
-- ============================================================================
