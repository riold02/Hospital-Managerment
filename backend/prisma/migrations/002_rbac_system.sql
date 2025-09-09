-- ============================================================================
-- MIGRATION 002: Role-Based Access Control (RBAC) System
-- Created: 2025-09-09
-- Description: Add RBAC tables and integrate with existing user system
-- Dependencies: 001_initial_schema.sql
-- ============================================================================

-- ============================================================================
-- RBAC CORE TABLES
-- ============================================================================

-- Users table (central authentication)
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles (Many-to-many: Users and Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_role_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id)
);

-- Role Permissions (Many-to-many: Roles and Permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_permission_id SERIAL PRIMARY KEY,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- ============================================================================
-- INTEGRATE WITH EXISTING TABLES
-- ============================================================================

-- Add user_id to staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id);

-- Add user_id to patients table  
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(user_id);

-- ============================================================================
-- INDEXES FOR RBAC PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
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

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_sync_staff_user_id ON staff;
CREATE TRIGGER trigger_sync_staff_user_id
    BEFORE INSERT OR UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_id_for_staff();

DROP TRIGGER IF EXISTS trigger_sync_patients_user_id ON patients;
CREATE TRIGGER trigger_sync_patients_user_id
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_id_for_patients();

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
        CASE NEW.role
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
            INSERT INTO user_roles (user_id, role_id, assigned_at, is_active)
            VALUES (NEW.user_id, target_role_id, CURRENT_TIMESTAMP, true)
            ON CONFLICT (user_id, role_id) DO UPDATE SET
                is_active = true,
                assigned_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply permission trigger to staff
DROP TRIGGER IF EXISTS trigger_set_staff_permissions ON staff;
CREATE TRIGGER trigger_set_staff_permissions
    AFTER INSERT OR UPDATE ON staff
    FOR EACH ROW
    EXECUTE FUNCTION set_user_permissions();

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
            INSERT INTO user_roles (user_id, role_id, assigned_at, is_active)
            VALUES (NEW.user_id, patient_role_id, CURRENT_TIMESTAMP, true)
            ON CONFLICT (user_id, role_id) DO UPDATE SET
                is_active = true,
                assigned_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply patient permission trigger
DROP TRIGGER IF EXISTS trigger_set_patient_permissions ON patients;
CREATE TRIGGER trigger_set_patient_permissions
    AFTER INSERT OR UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION set_patient_permissions();

-- ============================================================================
-- RBAC UPDATED_AT TRIGGERS
-- ============================================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
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
-- END OF MIGRATION 002
-- ============================================================================
