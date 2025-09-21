-- ============================================================================
-- MIGRATION 005: Link User -> User_Role -> Business Tables
-- Created: 2025-01-27
-- Description: Complete linking of user system with business tables
-- Dependencies: 002_rbac_system.sql
-- ============================================================================

-- ============================================================================
-- ADD MISSING USER_ID REFERENCES TO BUSINESS TABLES
-- ============================================================================

-- Add user_id to doctors table (doctors are also users)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Add user_id to ambulance table (for driver assignment)
ALTER TABLE ambulance ADD COLUMN IF NOT EXISTS driver_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- ============================================================================
-- CREATE MISSING BUSINESS TABLE RELATIONSHIPS
-- ============================================================================

-- Add user_id to medical_records (who created/updated the record)
ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Add user_id to prescription (who prescribed - should match doctor's user_id)
ALTER TABLE prescription ADD COLUMN IF NOT EXISTS prescribed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Add user_id to billing (who processed the billing)
ALTER TABLE billing ADD COLUMN IF NOT EXISTS processed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Add user_id to pharmacy (who dispensed the medicine)
ALTER TABLE pharmacy ADD COLUMN IF NOT EXISTS dispensed_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Add user_id to room_assignments (who made the assignment)
ALTER TABLE room_assignments ADD COLUMN IF NOT EXISTS assigned_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- Add user_id to cleaning_service (who performed the cleaning)
ALTER TABLE cleaning_service ADD COLUMN IF NOT EXISTS cleaned_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL;

-- ============================================================================
-- CREATE INDEXES FOR NEW RELATIONSHIPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_ambulance_driver_user_id ON ambulance(driver_user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_by_user_id ON medical_records(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_prescription_prescribed_by_user_id ON prescription(prescribed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_billing_processed_by_user_id ON billing(processed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_dispensed_by_user_id ON pharmacy(dispensed_by_user_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_assigned_by_user_id ON room_assignments(assigned_by_user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_service_cleaned_by_user_id ON cleaning_service(cleaned_by_user_id);

-- ============================================================================
-- UPDATE TRIGGERS FOR AUTOMATIC USER_ID SYNC
-- ============================================================================

-- Function to sync doctor user_id
CREATE OR REPLACE FUNCTION sync_doctor_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If user_id is not provided, try to find matching user by email
    IF NEW.user_id IS NULL AND NEW.email IS NOT NULL THEN
        SELECT user_id INTO NEW.user_id 
        FROM users 
        WHERE email = NEW.email 
        AND is_active = true
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync medical record created_by_user_id
CREATE OR REPLACE FUNCTION sync_medical_record_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If created_by_user_id is not provided, try to get from doctor's user_id
    IF NEW.created_by_user_id IS NULL AND NEW.doctor_id IS NOT NULL THEN
        SELECT user_id INTO NEW.created_by_user_id 
        FROM doctors 
        WHERE doctor_id = NEW.doctor_id 
        AND user_id IS NOT NULL
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync prescription prescribed_by_user_id
CREATE OR REPLACE FUNCTION sync_prescription_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If prescribed_by_user_id is not provided, try to get from doctor's user_id
    IF NEW.prescribed_by_user_id IS NULL AND NEW.prescribed_by IS NOT NULL THEN
        SELECT user_id INTO NEW.prescribed_by_user_id 
        FROM doctors 
        WHERE doctor_id = NEW.prescribed_by 
        AND user_id IS NOT NULL
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync ambulance driver user_id
CREATE OR REPLACE FUNCTION sync_ambulance_driver_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If driver_user_id is not provided, try to find driver staff by driver_id
    IF NEW.driver_user_id IS NULL AND NEW.driver_id IS NOT NULL THEN
        SELECT user_id INTO NEW.driver_user_id 
        FROM staff 
        WHERE staff_id = NEW.driver_id 
        AND user_id IS NOT NULL
        AND role = 'driver'
        LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_sync_doctor_user_id ON doctors;
CREATE TRIGGER trigger_sync_doctor_user_id
    BEFORE INSERT OR UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION sync_doctor_user_id();

DROP TRIGGER IF EXISTS trigger_sync_medical_record_user_id ON medical_records;
CREATE TRIGGER trigger_sync_medical_record_user_id
    BEFORE INSERT OR UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION sync_medical_record_user_id();

DROP TRIGGER IF EXISTS trigger_sync_prescription_user_id ON prescription;
CREATE TRIGGER trigger_sync_prescription_user_id
    BEFORE INSERT OR UPDATE ON prescription
    FOR EACH ROW
    EXECUTE FUNCTION sync_prescription_user_id();

DROP TRIGGER IF EXISTS trigger_sync_ambulance_driver_user_id ON ambulance;
CREATE TRIGGER trigger_sync_ambulance_driver_user_id
    BEFORE INSERT OR UPDATE ON ambulance
    FOR EACH ROW
    EXECUTE FUNCTION sync_ambulance_driver_user_id();

-- ============================================================================
-- UPDATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Doctors can see their own data + admins can see all doctors
CREATE POLICY doctors_access_policy ON doctors
    FOR ALL
    USING (
        user_id = current_setting('app.current_user_id', true)::UUID
        OR 
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name = 'admin'
            AND ur.is_active = true
        )
    );

-- Enable RLS on doctors table
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE VIEWS FOR COMMON USER-BUSINESS QUERIES
-- ============================================================================

-- View: User with their roles and business entity
CREATE OR REPLACE VIEW user_business_profile AS
SELECT 
    u.user_id,
    u.email,
    u.is_active,
    u.last_login,
    u.created_at,
    -- Staff information
    s.staff_id,
    s.first_name as staff_first_name,
    s.last_name as staff_last_name,
    s.role as staff_role,
    s.role,
    s.department_id,
    -- Patient information
    p.patient_id,
    p.first_name as patient_first_name,
    p.last_name as patient_last_name,
    p.date_of_birth,
    p.gender,
    -- Doctor information
    d.doctor_id,
    d.specialty,
    -- User roles
    array_agg(DISTINCT r.role_name) as user_roles,
    -- Permissions
    array_agg(DISTINCT CONCAT(perm.resource, ':', perm.action)) as permissions
FROM users u
LEFT JOIN staff s ON u.user_id = s.user_id
LEFT JOIN patients p ON u.user_id = p.user_id
LEFT JOIN doctors d ON u.user_id = d.user_id
LEFT JOIN user_roles ur ON u.user_id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.role_id AND r.is_active = true
LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
LEFT JOIN permissions perm ON rp.permission_id = perm.permission_id
GROUP BY 
    u.user_id, u.email, u.is_active, u.last_login, u.created_at,
    s.staff_id, s.first_name, s.last_name, s.role, s.department_id,
    p.patient_id, p.first_name, p.last_name, p.date_of_birth, p.gender,
    d.doctor_id, d.specialty;

-- View: Business activities by user
CREATE OR REPLACE VIEW user_business_activities AS
SELECT 
    u.user_id,
    u.email,
    -- Medical records created
    COUNT(DISTINCT mr.record_id) as medical_records_created,
    -- Prescriptions written
    COUNT(DISTINCT pr.prescription_id) as prescriptions_written,
    -- Appointments handled
    COUNT(DISTINCT a.appointment_id) as appointments_handled,
    -- Billing processed
    COUNT(DISTINCT b.bill_id) as billing_processed,
    -- Room assignments made
    COUNT(DISTINCT ra.assignment_id) as room_assignments_made,
    -- Cleaning services performed
    COUNT(DISTINCT cs.service_id) as cleaning_services_performed
FROM users u
LEFT JOIN medical_records mr ON u.user_id = mr.created_by_user_id
LEFT JOIN prescription pr ON u.user_id = pr.prescribed_by_user_id
LEFT JOIN appointments a ON EXISTS (SELECT 1 FROM doctors d WHERE d.doctor_id = a.doctor_id AND d.user_id = u.user_id)
LEFT JOIN billing b ON u.user_id = b.processed_by_user_id
LEFT JOIN room_assignments ra ON u.user_id = ra.assigned_by_user_id
LEFT JOIN cleaning_service cs ON u.user_id = cs.cleaned_by_user_id
GROUP BY u.user_id, u.email;

-- ============================================================================
-- CREATE HELPER FUNCTIONS FOR USER-BUSINESS OPERATIONS
-- ============================================================================

-- Function to get user's business entity type
CREATE OR REPLACE FUNCTION get_user_business_type(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    business_type TEXT;
BEGIN
    -- Check if user is staff
    IF EXISTS (SELECT 1 FROM staff WHERE user_id = p_user_id) THEN
        SELECT role INTO business_type FROM staff WHERE user_id = p_user_id;
        RETURN 'staff:' || business_type;
    END IF;
    
    -- Check if user is patient
    IF EXISTS (SELECT 1 FROM patients WHERE user_id = p_user_id) THEN
        RETURN 'patient';
    END IF;
    
    -- Check if user is doctor
    IF EXISTS (SELECT 1 FROM doctors WHERE user_id = p_user_id) THEN
        RETURN 'doctor';
    END IF;
    
    RETURN 'user';
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has permission for business operation
CREATE OR REPLACE FUNCTION user_has_business_permission(
    p_user_id UUID,
    p_resource TEXT,
    p_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.permission_id
        WHERE ur.user_id = p_user_id
        AND ur.is_active = true
        AND p.resource = p_resource
        AND p.action = p_action
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF MIGRATION 005
-- ============================================================================
