-- ============================================================================
-- MIGRATION 002: Role-Based Access Control (RBAC) System
-- Created: 2025-09-21 (Complete Optimized Version)
-- Description: Complete RBAC system with user authentication and business table integration
-- Dependencies: 001_initial_schema.sql
-- ============================================================================

-- ============================================================================
-- RBAC CORE TABLES
-- ============================================================================

-- Note: Users table is created in migration 001_initial_schema.sql

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(resource, action)
);

-- User Roles (Many-to-many: Users and Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- Role Permissions (Many-to-many: Roles and Permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_permission_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- ============================================================================
-- NOTE: USER_ID INTEGRATION
-- ============================================================================
-- 
-- User_id columns have been integrated directly into migration 001_initial_schema.sql
-- for better database diagram visualization. This migration focuses on RBAC-specific
-- tables and functionality only.
--

-- ============================================================================
-- INDEXES FOR RBAC PERFORMANCE
-- ============================================================================

-- Note: Users indexes are created in migration 001

-- User Roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);

-- Role Permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Note: Business table user_id indexes are created in migration 001

-- Permissions indexes
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

-- ============================================================================
-- RBAC TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to automatically sync user_id when creating staff/patient
CREATE OR REPLACE FUNCTION sync_user_id_for_staff()
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

CREATE OR REPLACE FUNCTION sync_user_id_for_patients()
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

-- Function to set user permissions based on staff role
CREATE OR REPLACE FUNCTION set_user_permissions()
RETURNS TRIGGER AS $$
DECLARE
    target_role_name VARCHAR(50);
    target_role_id INTEGER;
BEGIN
    -- Only process if user_id is present
    IF NEW.user_id IS NOT NULL THEN
        -- Map staff role to RBAC role
        CASE LOWER(NEW.role)
            WHEN 'admin' THEN target_role_name := 'admin';
            WHEN 'doctor' THEN target_role_name := 'doctor';
            WHEN 'nurse' THEN target_role_name := 'nurse';
            WHEN 'pharmacist' THEN target_role_name := 'pharmacist';
            WHEN 'technician' THEN target_role_name := 'technician';
            WHEN 'driver' THEN target_role_name := 'driver';
            WHEN 'worker' THEN target_role_name := 'worker';
            ELSE target_role_name := 'staff';
        END CASE;
        
        -- Get role_id
        SELECT role_id INTO target_role_id
        FROM roles
        WHERE role_name = target_role_name
        AND is_active = true
        LIMIT 1;
        
        -- Assign role to user if found
        IF target_role_id IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role_id, assigned_at)
            VALUES (NEW.user_id, target_role_id, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, role_id) DO UPDATE SET
                assigned_at = CURRENT_TIMESTAMP,
                is_active = true;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to assign patient role
CREATE OR REPLACE FUNCTION set_patient_permissions()
RETURNS TRIGGER AS $$
DECLARE
    patient_role_id INTEGER;
BEGIN
    -- Only process if user_id is present
    IF NEW.user_id IS NOT NULL THEN
        -- Get patient role_id
        SELECT role_id INTO patient_role_id
        FROM roles
        WHERE role_name = 'patient'
        AND is_active = true
        LIMIT 1;
        
        -- Assign patient role
        IF patient_role_id IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role_id, assigned_at)
            VALUES (NEW.user_id, patient_role_id, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, role_id) DO UPDATE SET
                assigned_at = CURRENT_TIMESTAMP,
                is_active = true;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY TRIGGERS
-- ============================================================================

-- Staff triggers
DROP TRIGGER IF EXISTS trigger_sync_staff_user_id ON staff;
CREATE TRIGGER trigger_sync_staff_user_id
    BEFORE INSERT OR UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_id_for_staff();

DROP TRIGGER IF EXISTS trigger_set_staff_permissions ON staff;
CREATE TRIGGER trigger_set_staff_permissions
    AFTER INSERT OR UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION set_user_permissions();

-- Patient triggers
DROP TRIGGER IF EXISTS trigger_sync_patients_user_id ON patients;
CREATE TRIGGER trigger_sync_patients_user_id
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_id_for_patients();

DROP TRIGGER IF EXISTS trigger_set_patient_permissions ON patients;
CREATE TRIGGER trigger_set_patient_permissions
    AFTER INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_patient_permissions();

-- Doctor triggers
DROP TRIGGER IF EXISTS trigger_sync_doctor_user_id ON doctors;
CREATE TRIGGER trigger_sync_doctor_user_id
    BEFORE INSERT OR UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION sync_doctor_user_id();

-- Medical records triggers
DROP TRIGGER IF EXISTS trigger_sync_medical_record_user_id ON medical_records;
CREATE TRIGGER trigger_sync_medical_record_user_id
    BEFORE INSERT OR UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION sync_medical_record_user_id();

-- Prescription triggers
DROP TRIGGER IF EXISTS trigger_sync_prescription_user_id ON prescriptions;
CREATE TRIGGER trigger_sync_prescription_user_id
    BEFORE INSERT OR UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_prescription_user_id();

-- Ambulance triggers
DROP TRIGGER IF EXISTS trigger_sync_ambulance_driver_user_id ON ambulance;
CREATE TRIGGER trigger_sync_ambulance_driver_user_id
    BEFORE INSERT OR UPDATE ON ambulance
    FOR EACH ROW
    EXECUTE FUNCTION sync_ambulance_driver_user_id();

-- ============================================================================
-- RBAC UPDATED_AT TRIGGERS
-- ============================================================================

-- Note: Users trigger is created in migration 001
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Users can see their own data
CREATE POLICY users_own_data ON users
    FOR ALL
    USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Staff can see their own data + admins can see all staff
CREATE POLICY staff_access_policy ON staff
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

-- Patients can see their own data + medical staff can see patient data
CREATE POLICY patients_access_policy ON patients
    FOR ALL
    USING (
        user_id = current_setting('app.current_user_id', true)::UUID
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name IN ('admin', 'doctor', 'nurse', 'pharmacist')
            AND ur.is_active = true
        )
    );

-- Medical records access: patients see own + medical staff see all
CREATE POLICY medical_records_access_policy ON medical_records
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.patient_id = medical_records.patient_id
            AND p.user_id = current_setting('app.current_user_id', true)::UUID
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name IN ('admin', 'doctor', 'nurse')
            AND ur.is_active = true
        )
    );

-- Appointments access: patients see own + doctors/nurses see all
CREATE POLICY appointments_access_policy ON appointments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.patient_id = appointments.patient_id
            AND p.user_id = current_setting('app.current_user_id', true)::UUID
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name IN ('admin', 'doctor', 'nurse')
            AND ur.is_active = true
        )
    );

-- Prescriptions access: patients see own + medical staff see all
CREATE POLICY prescriptions_access_policy ON prescriptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.patient_id = prescriptions.patient_id
            AND p.user_id = current_setting('app.current_user_id', true)::UUID
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name IN ('admin', 'doctor', 'nurse', 'pharmacist')
            AND ur.is_active = true
        )
    );

-- Billing access: patients see own + admin/billing staff see all
CREATE POLICY billing_access_policy ON billing
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM patients p
            WHERE p.patient_id = billing.patient_id
            AND p.user_id = current_setting('app.current_user_id', true)::UUID
        )
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.role_id
            WHERE ur.user_id = current_setting('app.current_user_id', true)::UUID
            AND r.role_name IN ('admin')
            AND ur.is_active = true
        )
    );

-- ============================================================================
-- HELPER VIEWS FOR COMMON USER-BUSINESS QUERIES
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
    COUNT(DISTINCT cs.cleaning_id) as cleaning_services_performed
FROM users u
LEFT JOIN medical_records mr ON u.user_id = mr.created_by_user_id
LEFT JOIN prescriptions pr ON u.user_id = pr.prescribed_by_user_id
LEFT JOIN appointments a ON EXISTS (SELECT 1 FROM doctors d WHERE d.doctor_id = a.doctor_id AND d.user_id = u.user_id)
LEFT JOIN billing b ON u.user_id = b.processed_by_user_id
LEFT JOIN room_assignments ra ON u.user_id = ra.assigned_by_user_id
LEFT JOIN cleaning_service cs ON u.user_id = cs.cleaned_by_user_id
GROUP BY u.user_id, u.email;

-- ============================================================================
-- HELPER FUNCTIONS FOR USER-BUSINESS OPERATIONS
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
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Central user authentication table for all system users';
COMMENT ON TABLE roles IS 'System roles for role-based access control';
COMMENT ON TABLE permissions IS 'System permissions for granular access control';
COMMENT ON TABLE user_roles IS 'Many-to-many relationship between users and roles';
COMMENT ON TABLE role_permissions IS 'Many-to-many relationship between roles and permissions';
COMMENT ON TABLE password_reset_tokens IS 'Secure tokens for password reset functionality';

COMMENT ON COLUMN password_reset_tokens.token_hash IS 'Hashed version of reset token sent via email';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration timestamp (typically 15-30 minutes)';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Timestamp when token was used (NULL = unused)';

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
BEGIN
    -- Verify core RBAC tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Failed to create users table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
        RAISE EXCEPTION 'Failed to create roles table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
        RAISE EXCEPTION 'Failed to create permissions table';
    END IF;
    
    RAISE NOTICE 'Migration 002 (RBAC System) completed successfully!';
END $$;

-- ============================================================================
-- END OF MIGRATION 002
-- ============================================================================
