-- ============================================================================
-- PostgreSQL schema converted from backend/src/config/database.sql (SQL Server)
-- - No RLS, authorization handled at application layer via staff.role
-- - Uses GENERATED ALWAYS AS IDENTITY where appropriate
-- - Uses timestamptz and now() defaults
-- ============================================================================

-- Drop existing tables in dependency order (safe for re-run)
DROP TABLE IF EXISTS medical_records_medicine CASCADE;
DROP TABLE IF EXISTS ambulance_log CASCADE;
DROP TABLE IF EXISTS ambulance CASCADE;
DROP TABLE IF EXISTS prescription CASCADE;
DROP TABLE IF EXISTS cleaning_service CASCADE;
DROP TABLE IF EXISTS room_assignments CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS room_types CASCADE;
DROP TABLE IF EXISTS pharmacy CASCADE;
DROP TABLE IF EXISTS medicine CASCADE;
DROP TABLE IF EXISTS blood_bank CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS nurses CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS billing CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_department CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS doctors CASCADE;
DROP TABLE IF EXISTS patients CASCADE;

-- Patients
CREATE TABLE patients (
    patient_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M','F','O')),
    contact_number VARCHAR(15),
    address VARCHAR(255),
    email VARCHAR(100),
    medical_history TEXT,
    created_at timestamptz DEFAULT now()
);

-- Doctors
CREATE TABLE doctors (
    doctor_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15),
    email VARCHAR(100),
    available_schedule TEXT,
    created_at timestamptz DEFAULT now()
);

-- Departments
CREATE TABLE departments (
    department_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    department_name VARCHAR(50),
    location VARCHAR(100)
);

-- Doctor_Department (junction)
CREATE TABLE doctor_department (
    doctor_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    PRIMARY KEY (doctor_id, department_id),
    CONSTRAINT fk_dd_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    CONSTRAINT fk_dd_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

-- Appointments
CREATE TABLE appointments (
    appointment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    purpose VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Scheduled',
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL
);

-- Medical_Records
CREATE TABLE medical_records (
    record_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER,
    appointment_id INTEGER,
    diagnosis TEXT,
    treatment TEXT,
    prescription TEXT,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fk_mr_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_mr_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE SET NULL,
    CONSTRAINT fk_mr_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE NO ACTION
);

-- Billing
CREATE TABLE billing (
    bill_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    appointment_id INTEGER,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    payment_date DATE,
    insurance_provider VARCHAR(100),
    created_at timestamptz DEFAULT now(),
    CONSTRAINT fk_billing_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_billing_appt FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE NO ACTION
);

-- Staff
CREATE TABLE staff (
    staff_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- app-level role, no CHECK constraint
    department_id INTEGER,
    contact_number VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    hire_date DATE,
    CONSTRAINT fk_staff_department FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL
);

-- Nurses
CREATE TABLE nurses (
    nurse_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_id INTEGER NOT NULL,
    specialization VARCHAR(50),
    shift_hours TEXT,
    CONSTRAINT fk_nurse_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Workers
CREATE TABLE workers (
    worker_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    staff_id INTEGER,
    job_title VARCHAR(50),
    work_schedule TEXT,
    CONSTRAINT fk_worker_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- Medicine
CREATE TABLE medicine (
    medicine_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    brand VARCHAR(50),
    type VARCHAR(20) CHECK (type IN ('Tablet','Capsule','Liquid','Injection','Ointment')),
    dosage VARCHAR(50),
    stock_quantity INTEGER CHECK (stock_quantity >= 0),
    expiry_date DATE,
    created_at timestamptz DEFAULT now()
);

-- Pharmacy
CREATE TABLE pharmacy (
    pharmacy_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    medicine_id INTEGER,
    patient_id INTEGER,
    quantity INTEGER,
    prescription_date DATE,
    CONSTRAINT fk_pharm_medicine FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id) ON DELETE CASCADE,
    CONSTRAINT fk_pharm_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Blood_Bank
CREATE TABLE blood_bank (
    blood_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    blood_type VARCHAR(3) CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
    stock_quantity INTEGER CHECK (stock_quantity >= 0),
    last_updated DATE
);

-- Room_Types
CREATE TABLE room_types (
    room_type_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_type_name VARCHAR(50) NOT NULL,
    description VARCHAR(255)
);

-- Rooms
CREATE TABLE rooms (
    room_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type_id INTEGER,
    capacity INTEGER,
    status VARCHAR(20) CHECK (status IN ('Available','Occupied','Under Maintenance')),
    last_serviced DATE,
    CONSTRAINT fk_room_type FOREIGN KEY (room_type_id) REFERENCES room_types(room_type_id) ON DELETE SET NULL
);

-- Room_Assignments
CREATE TABLE room_assignments (
    assignment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id INTEGER,
    staff_id INTEGER,
    patient_id INTEGER,
    assignment_date timestamptz DEFAULT now(),
    end_date timestamptz,
    CONSTRAINT fk_ra_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    CONSTRAINT fk_ra_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    CONSTRAINT fk_ra_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE SET NULL
);

-- Cleaning_Service
CREATE TABLE cleaning_service (
    service_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id INTEGER,
    service_date DATE DEFAULT (now()::date),
    service_time TIME DEFAULT (now()::time),
    staff_id INTEGER,
    notes VARCHAR(255),
    CONSTRAINT fk_cs_room FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT fk_cs_staff FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

-- Prescription
CREATE TABLE prescription (
    prescription_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    prescription_date DATE DEFAULT (now()::date),
    medication_name VARCHAR(100),
    dosage VARCHAR(100),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    notes VARCHAR(255),
    CONSTRAINT fk_presc_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
    CONSTRAINT fk_presc_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
);

-- Ambulance
CREATE TABLE ambulance (
    ambulance_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ambulance_number VARCHAR(10) UNIQUE,
    availability VARCHAR(15) CHECK (availability IN ('Available','On Duty','Maintenance')),
    driver_id INTEGER,
    last_service_date DATE,
    CONSTRAINT fk_amb_driver FOREIGN KEY (driver_id) REFERENCES staff(staff_id) ON DELETE NO ACTION
);

-- Ambulance_Log
CREATE TABLE ambulance_log (
    log_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ambulance_id INTEGER,
    patient_id INTEGER,
    pickup_location VARCHAR(100),
    dropoff_location VARCHAR(100),
    pickup_time timestamptz,
    dropoff_time timestamptz,
    status VARCHAR(15) CHECK (status IN ('Completed','In Progress','Canceled')),
    CONSTRAINT fk_al_amb FOREIGN KEY (ambulance_id) REFERENCES ambulance(ambulance_id) ON DELETE CASCADE,
    CONSTRAINT fk_al_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- Medical_Records_Medicine (junction)
CREATE TABLE medical_records_medicine (
    record_id INTEGER,
    medicine_id INTEGER,
    dosage VARCHAR(50),
    PRIMARY KEY (record_id, medicine_id),
    CONSTRAINT fk_mrm_record FOREIGN KEY (record_id) REFERENCES medical_records(record_id) ON DELETE CASCADE,
    CONSTRAINT fk_mrm_medicine FOREIGN KEY (medicine_id) REFERENCES medicine(medicine_id) ON DELETE CASCADE
);

-- Indexes (converted from inline INDEX definitions)
CREATE INDEX IF NOT EXISTS idx_patient_name ON patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointments(appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_record_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON billing(payment_status);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_blood_type ON blood_bank(blood_type);
CREATE INDEX IF NOT EXISTS idx_room_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_log_status ON ambulance_log(status);
CREATE INDEX IF NOT EXISTS idx_medicine_type ON medicine(type);
CREATE INDEX IF NOT EXISTS idx_medicine_expiry ON medicine(expiry_date);

-- Notes:
-- - Authorization to be enforced in application using staff.role
-- - No RLS, no RBAC tables created
-- - Use Supabase SQL Editor to run this file as postgres role

-- Done


