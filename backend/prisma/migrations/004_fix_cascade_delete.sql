-- Fix foreign key constraints to CASCADE delete instead of SET NULL
-- This ensures when a patient/doctor/staff is deleted, their related records are also deleted

-- Drop existing foreign key constraints
ALTER TABLE room_assignments 
  DROP CONSTRAINT IF EXISTS room_assignments_patient_id_fkey;

ALTER TABLE room_assignments 
  DROP CONSTRAINT IF EXISTS room_assignments_staff_id_fkey;

-- Recreate with CASCADE delete
ALTER TABLE room_assignments 
  ADD CONSTRAINT room_assignments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE;

ALTER TABLE room_assignments 
  ADD CONSTRAINT room_assignments_staff_id_fkey 
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE;

-- Medical records
ALTER TABLE medical_records 
  DROP CONSTRAINT IF EXISTS medical_records_patient_id_fkey;

ALTER TABLE medical_records 
  ADD CONSTRAINT medical_records_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE;

ALTER TABLE medical_records 
  DROP CONSTRAINT IF EXISTS medical_records_doctor_id_fkey;

ALTER TABLE medical_records 
  ADD CONSTRAINT medical_records_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE;

-- Prescriptions
ALTER TABLE prescriptions 
  DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;

ALTER TABLE prescriptions 
  ADD CONSTRAINT prescriptions_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE;

-- Appointments
ALTER TABLE appointments 
  DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

ALTER TABLE appointments 
  ADD CONSTRAINT appointments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE;

ALTER TABLE appointments 
  DROP CONSTRAINT IF EXISTS appointments_doctor_id_fkey;

ALTER TABLE appointments 
  ADD CONSTRAINT appointments_doctor_id_fkey 
  FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE;

-- Nurse patient assignments
ALTER TABLE nurse_patient_assignments 
  DROP CONSTRAINT IF EXISTS nurse_patient_assignments_patient_id_fkey;

ALTER TABLE nurse_patient_assignments 
  ADD CONSTRAINT nurse_patient_assignments_patient_id_fkey 
  FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE;

ALTER TABLE nurse_patient_assignments 
  DROP CONSTRAINT IF EXISTS nurse_patient_assignments_nurse_id_fkey;

ALTER TABLE nurse_patient_assignments 
  ADD CONSTRAINT nurse_patient_assignments_nurse_id_fkey 
  FOREIGN KEY (nurse_id) REFERENCES staff(staff_id) ON DELETE CASCADE;

