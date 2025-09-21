-- ============================================================================
-- HOSPITAL MANAGEMENT SYSTEM - DATABASE SCHEMA DOCUMENTATION
-- ============================================================================
-- This file contains the complete database schema for generating ER diagrams
-- Generated on: September 20, 2025
-- Database: PostgreSQL 15
-- Total Tables: 24
-- ============================================================================

-- ============================================================================
-- CORE USER MANAGEMENT TABLES
-- ============================================================================

-- Users table (Authentication & Authorization)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (RBAC System)
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User Roles junction table
CREATE TABLE user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id)
);

-- Permissions table
CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    permission_description TEXT,
    resource VARCHAR(50),
    action VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions junction table
CREATE TABLE role_permissions (
    role_id INTEGER NOT NULL,
    permission_id INTEGER NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(user_id)
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL, -- bcrypt hashed token for security
    expires_at TIMESTAMPTZ NOT NULL, -- Token expiration time
    used_at TIMESTAMPTZ, -- When the token was used (null if not used)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- HOSPITAL PERSONNEL TABLES
-- ============================================================================

-- Departments table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    department_head_id INTEGER,
    location VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(100),
    budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Staff table (All hospital employees)
CREATE TABLE staff (
    staff_id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'pharmacist', 'technician', 'driver', 'worker')),
    position VARCHAR(100),
    department_id INTEGER,
    hire_date DATE,
    salary DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- Doctors table (Specialized staff)
CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    staff_id INTEGER UNIQUE,
    user_id UUID UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    license_number VARCHAR(50),
    available_schedule TEXT,
    consultation_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- PATIENT MANAGEMENT TABLES
-- ============================================================================

-- Patients table
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    patient_code VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID UNIQUE,
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ============================================================================
-- MEDICAL SERVICES TABLES
-- ============================================================================

-- Appointments table
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    appointment_type VARCHAR(50),
    reason TEXT,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Medical Records table
CREATE TABLE medical_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER,
    visit_date DATE NOT NULL,
    diagnosis TEXT,
    symptoms TEXT,
    treatment TEXT,
    notes TEXT,
    vital_signs JSONB, -- Blood pressure, temperature, etc.
    lab_results JSONB,
    follow_up_date DATE,
    created_by_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id),
    FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- PHARMACY & MEDICATION TABLES
-- ============================================================================

-- Medicine table
CREATE TABLE medicine (
    medicine_id SERIAL PRIMARY KEY,
    medicine_name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    manufacturer VARCHAR(100),
    category VARCHAR(50),
    dosage_form VARCHAR(50), -- tablet, capsule, syrup, injection, etc.
    strength VARCHAR(50),
    unit_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    expiry_date DATE,
    batch_number VARCHAR(50),
    storage_conditions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE prescriptions (
    prescription_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    prescription_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled')),
    total_amount DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Prescription Items table
CREATE TABLE prescription_items (
    item_id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL,
    medicine_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id)
);

-- Pharmacy Records table
CREATE TABLE pharmacy_records (
    record_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    prescription_id INTEGER,
    pharmacist_id INTEGER,
    dispensed_date DATE NOT NULL,
    total_amount DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'dispensed' CHECK (status IN ('dispensed', 'returned', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id),
    FOREIGN KEY (pharmacist_id) REFERENCES staff(staff_id)
);

-- Medical Record Medicine junction table
CREATE TABLE medical_record_medicine (
    record_id INTEGER NOT NULL,
    medicine_id INTEGER NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    prescribed_date DATE,
    PRIMARY KEY (record_id, medicine_id),
    FOREIGN KEY (record_id) REFERENCES medical_records(record_id) ON DELETE CASCADE,
    FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id)
);

-- ============================================================================
-- FACILITY MANAGEMENT TABLES
-- ============================================================================

-- Room Types table
CREATE TABLE room_types (
    room_type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    base_rate DECIMAL(10,2),
    capacity INTEGER,
    amenities JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type_id INTEGER NOT NULL,
    floor_number INTEGER,
    building VARCHAR(50),
    capacity INTEGER DEFAULT 1,
    current_occupancy INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'out_of_service')),
    daily_rate DECIMAL(10,2),
    equipment JSONB,
    last_cleaned TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id)
);

-- Room Assignments table
CREATE TABLE room_assignments (
    assignment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    staff_id INTEGER,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('admission', 'transfer', 'discharge')),
    assigned_date DATE NOT NULL,
    assigned_time TIME,
    expected_discharge_date DATE,
    actual_discharge_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    notes TEXT,
    assigned_by_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- SUPPORT SERVICES TABLES
-- ============================================================================

-- Ambulances table
CREATE TABLE ambulances (
    ambulance_id SERIAL PRIMARY KEY,
    ambulance_number VARCHAR(10) UNIQUE NOT NULL,
    vehicle_model VARCHAR(100),
    license_plate VARCHAR(20),
    driver_id INTEGER,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_service', 'maintenance', 'out_of_service')),
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    mileage INTEGER DEFAULT 0,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    equipment JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES staff(staff_id)
);

-- Ambulance Logs table
CREATE TABLE ambulance_logs (
    log_id SERIAL PRIMARY KEY,
    ambulance_id INTEGER NOT NULL,
    patient_id INTEGER,
    driver_id INTEGER NOT NULL,
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
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(ambulance_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (driver_id) REFERENCES staff(staff_id)
);

-- Cleaning Service table
CREATE TABLE cleaning_service (
    cleaning_id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL,
    staff_id INTEGER NOT NULL,
    cleaning_date DATE NOT NULL,
    cleaning_time TIME,
    cleaning_type VARCHAR(50) CHECK (cleaning_type IN ('routine', 'deep', 'disinfection', 'maintenance')),
    duration_minutes INTEGER,
    supplies_used JSONB,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    cleaned_by_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id),
    FOREIGN KEY (cleaned_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- FINANCIAL MANAGEMENT TABLES
-- ============================================================================

-- Billing table
CREATE TABLE billing (
    bill_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'cancelled')),
    payment_method VARCHAR(50),
    insurance_claim_amount DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    processed_by_user_id UUID,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    FOREIGN KEY (processed_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- User management indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_is_active ON user_roles(is_active);

-- Patient indexes
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_is_active ON patients(is_active);
CREATE INDEX idx_patients_patient_code ON patients(patient_code);

-- Staff indexes
CREATE INDEX idx_staff_user_id ON staff(user_id);
CREATE INDEX idx_staff_department_id ON staff(department_id);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- Appointment indexes
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Medical record indexes
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);

-- Billing indexes
CREATE INDEX idx_billing_patient_id ON billing(patient_id);
CREATE INDEX idx_billing_payment_status ON billing(payment_status);
CREATE INDEX idx_billing_bill_date ON billing(bill_date);

-- Room management indexes
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_room_type_id ON rooms(room_type_id);
CREATE INDEX idx_room_assignments_patient_id ON room_assignments(patient_id);
CREATE INDEX idx_room_assignments_room_id ON room_assignments(room_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (simplified)
CREATE POLICY users_own_data ON users
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY patients_access_policy ON patients
    USING (
        user_id = current_setting('app.current_user_id', true)::UUID OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name IN ('admin', 'doctor', 'nurse', 'pharmacist')
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Patient summary view
CREATE VIEW patient_summary AS
SELECT 
    p.patient_id,
    p.patient_code,
    p.first_name || ' ' || p.last_name AS full_name,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.email,
    p.blood_type,
    p.is_active,
    u.email AS user_email,
    u.last_login
FROM patients p
LEFT JOIN users u ON p.user_id = u.user_id;

-- Staff summary view
CREATE VIEW staff_summary AS
SELECT 
    s.staff_id,
    s.employee_id,
    s.first_name || ' ' || s.last_name AS full_name,
    s.role,
    s.position,
    d.department_name,
    s.email,
    s.phone,
    s.is_active,
    u.email AS user_email
FROM staff s
LEFT JOIN departments d ON s.department_id = d.department_id
LEFT JOIN users u ON s.user_id = u.user_id;

-- Appointment summary view
CREATE VIEW appointment_summary AS
SELECT 
    a.appointment_id,
    p.patient_code,
    p.first_name || ' ' || p.last_name AS patient_name,
    d.first_name || ' ' || d.last_name AS doctor_name,
    d.specialty,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.appointment_type,
    a.reason
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN doctors d ON a.doctor_id = d.doctor_id;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_updated_at BEFORE UPDATE ON billing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ambulances_updated_at BEFORE UPDATE ON ambulances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================