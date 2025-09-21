-- ============================================================================
-- MIGRATION 003: RBAC Seed Data
-- Created: 2025-09-09
-- Description: Insert initial roles, permissions, and admin user for RBAC system
-- Dependencies: 002_rbac_system.sql
-- ============================================================================

-- ============================================================================
-- INSERT ROLES
-- ============================================================================

INSERT INTO roles (role_name, description, is_active) VALUES
('admin', 'System Administrator - Full access to all resources', true),
('doctor', 'Medical Doctor - Access to patient care and medical records', true),
('nurse', 'Registered Nurse - Patient care and basic medical functions', true),
('pharmacist', 'Pharmacist - Medicine management and dispensing', true),
('technician', 'Medical Technician - Lab tests and technical support', true),
('driver', 'Ambulance Driver - Emergency transport services', true),
('worker', 'General Worker - Cleaning and maintenance services', true),
('patient', 'Patient - Access to own medical information', true)
ON CONFLICT (role_name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- INSERT PERMISSIONS
-- ============================================================================

-- User Management Permissions
INSERT INTO permissions (permission_name, resource, action, description) VALUES
('users:create', 'users', 'create', 'Create new users'),
('users:read', 'users', 'read', 'View user information'),
('users:update', 'users', 'update', 'Update user information'),
('users:delete', 'users', 'delete', 'Delete users'),
('users:manage_roles', 'users', 'manage_roles', 'Assign/remove user roles'),

-- Staff Management Permissions
('staff:create', 'staff', 'create', 'Create new staff members'),
('staff:read', 'staff', 'read', 'View staff information'),
('staff:update', 'staff', 'update', 'Update staff information'),
('staff:delete', 'staff', 'delete', 'Delete staff members'),

-- Patient Management Permissions
('patients:create', 'patients', 'create', 'Register new patients'),
('patients:read', 'patients', 'read', 'View patient information'),
('patients:update', 'patients', 'update', 'Update patient information'),
('patients:delete', 'patients', 'delete', 'Delete patient records'),

-- Medical Records Permissions
('medical_records:create', 'medical_records', 'create', 'Create medical records'),
('medical_records:read', 'medical_records', 'read', 'View medical records'),
('medical_records:update', 'medical_records', 'update', 'Update medical records'),
('medical_records:delete', 'medical_records', 'delete', 'Delete medical records'),

-- Appointment Permissions
('appointments:create', 'appointments', 'create', 'Schedule appointments'),
('appointments:read', 'appointments', 'read', 'View appointments'),
('appointments:update', 'appointments', 'update', 'Update appointments'),
('appointments:delete', 'appointments', 'delete', 'Cancel appointments'),

-- Prescription Permissions
('prescriptions:create', 'prescriptions', 'create', 'Create prescriptions'),
('prescriptions:read', 'prescriptions', 'read', 'View prescriptions'),
('prescriptions:update', 'prescriptions', 'update', 'Update prescriptions'),
('prescriptions:delete', 'prescriptions', 'delete', 'Delete prescriptions'),

-- Medicine Management Permissions
('medicine:create', 'medicine', 'create', 'Add new medicines'),
('medicine:read', 'medicine', 'read', 'View medicine information'),
('medicine:update', 'medicine', 'update', 'Update medicine information'),
('medicine:delete', 'medicine', 'delete', 'Remove medicines'),
('medicine:dispense', 'medicine', 'dispense', 'Dispense medicines to patients'),

-- Pharmacy Permissions
('pharmacy:read', 'pharmacy', 'read', 'View pharmacy records'),
('pharmacy:dispense', 'pharmacy', 'dispense', 'Dispense medications'),
('pharmacy:manage_stock', 'pharmacy', 'manage_stock', 'Manage medicine stock'),

-- Billing Permissions
('billing:create', 'billing', 'create', 'Create billing records'),
('billing:read', 'billing', 'read', 'View billing information'),
('billing:update', 'billing', 'update', 'Update billing records'),
('billing:delete', 'billing', 'delete', 'Delete billing records'),

-- Room Management Permissions
('rooms:read', 'rooms', 'read', 'View room information'),
('rooms:update', 'rooms', 'update', 'Update room status'),
('rooms:assign', 'rooms', 'assign', 'Assign rooms to patients/staff'),

-- Department Permissions
('departments:read', 'departments', 'read', 'View department information'),
('departments:update', 'departments', 'update', 'Update department information'),

-- Ambulance Permissions
('ambulances:read', 'ambulances', 'read', 'View ambulance information'),
('ambulances:update', 'ambulances', 'update', 'Update ambulance status'),
('ambulances:dispatch', 'ambulances', 'dispatch', 'Dispatch ambulances'),

-- Cleaning Service Permissions
('cleaning:create', 'cleaning', 'create', 'Schedule cleaning services'),
('cleaning:read', 'cleaning', 'read', 'View cleaning records'),
('cleaning:update', 'cleaning', 'update', 'Update cleaning records'),

-- Reports Permissions
('reports:read', 'reports', 'read', 'View system reports'),
('reports:generate', 'reports', 'generate', 'Generate custom reports'),

-- System Administration Permissions
('system:manage', 'system', 'manage', 'Full system administration access'),
('system:backup', 'system', 'backup', 'Create system backups'),
('system:restore', 'system', 'restore', 'Restore system from backup')

ON CONFLICT (permission_name) DO UPDATE SET
    resource = EXCLUDED.resource,
    action = EXCLUDED.action,
    description = EXCLUDED.description;

-- ============================================================================
-- ASSIGN PERMISSIONS TO ROLES
-- ============================================================================

-- Admin Role - Full Access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Doctor Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'doctor'
AND p.permission_name IN (
    -- Patient management
    'patients:read', 'patients:update',
    -- Medical records
    'medical_records:create', 'medical_records:read', 'medical_records:update',
    -- Appointments
    'appointments:create', 'appointments:read', 'appointments:update',
    -- Prescriptions
    'prescriptions:create', 'prescriptions:read', 'prescriptions:update',
    -- Medicine
    'medicine:read',
    -- Rooms
    'rooms:read',
    -- Reports
    'reports:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Nurse Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'nurse'
AND p.permission_name IN (
    -- Patient management
    'patients:read', 'patients:update',
    -- Medical records
    'medical_records:read', 'medical_records:update',
    -- Appointments
    'appointments:read', 'appointments:update',
    -- Prescriptions
    'prescriptions:read',
    -- Medicine
    'medicine:read',
    -- Rooms
    'rooms:read', 'rooms:update', 'rooms:assign',
    -- Cleaning
    'cleaning:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Pharmacist Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'pharmacist'
AND p.permission_name IN (
    -- Patient management (limited)
    'patients:read',
    -- Prescriptions
    'prescriptions:read', 'prescriptions:update',
    -- Medicine
    'medicine:create', 'medicine:read', 'medicine:update', 'medicine:dispense',
    -- Pharmacy
    'pharmacy:read', 'pharmacy:dispense', 'pharmacy:manage_stock',
    -- Reports
    'reports:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Technician Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'technician'
AND p.permission_name IN (
    -- Patient management (limited)
    'patients:read',
    -- Medical records (limited)
    'medical_records:read',
    -- Medicine
    'medicine:read',
    -- Rooms
    'rooms:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Driver Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'driver'
AND p.permission_name IN (
    -- Patient management (limited)
    'patients:read',
    -- Ambulances
    'ambulances:read', 'ambulances:update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Worker Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'worker'
AND p.permission_name IN (
    -- Rooms
    'rooms:read',
    -- Cleaning
    'cleaning:create', 'cleaning:read', 'cleaning:update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Patient Role Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'patient'
AND p.permission_name IN (
    -- Own data only (enforced by RLS policies)
    'patients:read',
    'medical_records:read',
    'appointments:read',
    'prescriptions:read',
    'billing:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ============================================================================
-- CREATE INITIAL ADMIN USER
-- ============================================================================

-- Insert admin user
INSERT INTO users (user_id, email, password_hash, is_active, is_verified)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'admin@hospital.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    true,
    true
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    is_active = EXCLUDED.is_active,
    is_verified = EXCLUDED.is_verified,
    updated_at = CURRENT_TIMESTAMP;

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id, assigned_at, is_active)
SELECT 
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    r.role_id,
    CURRENT_TIMESTAMP,
    true
FROM roles r
WHERE r.role_name = 'admin'
ON CONFLICT (user_id, role_id) DO UPDATE SET
    is_active = true,
    assigned_at = CURRENT_TIMESTAMP;

-- Create admin staff record
INSERT INTO staff (
    staff_id,
    employee_id,
    first_name,
    last_name,
    email,
    phone,
    role,
    position,
    hire_date,
    salary,
    is_active,
    user_id
) VALUES (
    1,
    'ADM001',
    'System',
    'Administrator',
    'admin@hospital.com',
    '+1234567890',
    'admin',
    'System Administrator',
    CURRENT_DATE,
    100000.00,
    true,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID
)
ON CONFLICT (employee_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    position = EXCLUDED.position,
    is_active = EXCLUDED.is_active,
    user_id = EXCLUDED.user_id,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================================================
-- CREATE DEMO USERS FOR TESTING
-- ============================================================================

-- Demo Doctor
INSERT INTO users (user_id, email, password_hash, is_active, is_verified) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, 'doctor@hospital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, role_id FROM roles WHERE role_name = 'doctor'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Demo Nurse
INSERT INTO users (user_id, email, password_hash, is_active, is_verified) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, 'nurse@hospital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, role_id FROM roles WHERE role_name = 'nurse'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Demo Pharmacist
INSERT INTO users (user_id, email, password_hash, is_active, is_verified) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, 'pharmacist@hospital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, role_id FROM roles WHERE role_name = 'pharmacist'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Demo Patient
INSERT INTO users (user_id, email, password_hash, is_active, is_verified) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, 'patient@hospital.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID, role_id FROM roles WHERE role_name = 'patient'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (FOR TESTING)
-- ============================================================================

-- Check roles count
-- SELECT 'Roles created:' as info, COUNT(*) as count FROM roles;

-- Check permissions count  
-- SELECT 'Permissions created:' as info, COUNT(*) as count FROM permissions;

-- Check role-permission mappings
-- SELECT 'Role-Permission mappings:' as info, COUNT(*) as count FROM role_permissions;

-- Check admin user
-- SELECT 'Admin user created:' as info, email FROM users WHERE email = 'admin@hospital.com';

-- Check admin permissions
-- SELECT 'Admin permissions:' as info, COUNT(*) as permission_count
-- FROM user_roles ur
-- JOIN roles r ON ur.role_id = r.role_id  
-- JOIN role_permissions rp ON r.role_id = rp.role_id
-- WHERE ur.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID;

-- ============================================================================
-- END OF MIGRATION 003
-- ============================================================================
