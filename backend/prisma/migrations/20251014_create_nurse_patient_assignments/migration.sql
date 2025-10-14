-- Create nurse_patient_assignments table
-- This table manages which nurse is responsible for which patient

CREATE TABLE nurse_patient_assignments (
    assignment_id SERIAL PRIMARY KEY,
    nurse_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    assigned_by_user_id UUID,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    shift_type VARCHAR(20), -- 'morning', 'afternoon', 'night', 'all_day'
    priority VARCHAR(20) DEFAULT 'normal', -- 'normal', 'high', 'critical'
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    CONSTRAINT fk_nurse FOREIGN KEY (nurse_id) REFERENCES staff(staff_id) ON DELETE CASCADE,
    CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_assigned_by FOREIGN KEY (assigned_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT chk_shift_type CHECK (shift_type IN ('morning', 'afternoon', 'night', 'all_day')),
    CONSTRAINT chk_priority CHECK (priority IN ('normal', 'high', 'critical')),
    CONSTRAINT chk_status CHECK (status IN ('active', 'completed', 'cancelled', 'transferred')),
    CONSTRAINT chk_dates CHECK (end_date IS NULL OR end_date >= start_date),

    -- Unique constraint: one nurse can't be assigned to same patient multiple times with overlapping active periods
    CONSTRAINT unique_active_assignment UNIQUE (nurse_id, patient_id, start_date) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for performance
CREATE INDEX idx_nurse_patient_assignments_nurse ON nurse_patient_assignments(nurse_id);
CREATE INDEX idx_nurse_patient_assignments_patient ON nurse_patient_assignments(patient_id);
CREATE INDEX idx_nurse_patient_assignments_status ON nurse_patient_assignments(status);
CREATE INDEX idx_nurse_patient_assignments_dates ON nurse_patient_assignments(start_date, end_date);
CREATE INDEX idx_nurse_patient_assignments_shift ON nurse_patient_assignments(shift_type);
CREATE INDEX idx_nurse_patient_assignments_priority ON nurse_patient_assignments(priority);
CREATE INDEX idx_nurse_patient_assignments_assigned_by ON nurse_patient_assignments(assigned_by_user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_nurse_patient_assignments_updated_at
    BEFORE UPDATE ON nurse_patient_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE nurse_patient_assignments IS 'Manages nurse-to-patient assignments for patient care responsibility';
COMMENT ON COLUMN nurse_patient_assignments.shift_type IS 'Which shift this nurse is responsible for this patient';
COMMENT ON COLUMN nurse_patient_assignments.priority IS 'Priority level of patient care needed';
COMMENT ON COLUMN nurse_patient_assignments.status IS 'active: currently assigned, completed: care finished, cancelled: assignment cancelled, transferred: patient transferred to another nurse';
