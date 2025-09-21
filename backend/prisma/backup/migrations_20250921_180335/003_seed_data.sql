-- ============================================================================
-- MIGRATION 003: Complete Seed Data for Hospital Management System
-- Created: 2025-09-21 (Complete Optimized Version)
-- Description: Complete seed data including roles, permissions, users, and sample hospital data
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
-- HOSPITAL ORGANIZATIONAL DATA
-- ============================================================================

-- 1. Departments (Khoa/Phòng ban)
INSERT INTO departments (department_name, location) VALUES
('Khoa Nội', 'Tầng 2 - Khu A'),
('Khoa Ngoại', 'Tầng 3 - Khu A'),
('Khoa Tim mạch', 'Tầng 4 - Khu B'),
('Khoa Sản Phụ khoa', 'Tầng 2 - Khu C'),
('Khoa Nhi', 'Tầng 1 - Khu C'),
('Khoa Cấp cứu', 'Tầng 1 - Khu A'),
('Khoa Chẩn đoán hình ảnh', 'Tầng trệt - Khu B'),
('Khoa Xét nghiệm', 'Tầng trệt - Khu A'),
('Khoa Phục hồi chức năng', 'Tầng 1 - Khu B'),
('Khoa Dược', 'Tầng trệt - Khu C')
ON CONFLICT DO NOTHING;

-- 2. Room Types
INSERT INTO room_types (type_name, description) VALUES
('Phòng đơn VIP', 'Phòng điều trị đơn cao cấp với đầy đủ tiện nghi'),
('Phòng đôi', 'Phòng điều trị 2 giường bệnh'),
('Phòng 4 giường', 'Phòng điều trị tập thể 4 giường'),
('Phòng ICU', 'Phòng hồi sức tích cực'),
('Phòng mổ', 'Phòng phẫu thuật vô trùng'),
('Phòng khám', 'Phòng khám bệnh và tư vấn'),
('Phòng siêu âm', 'Phòng chẩn đoán hình ảnh siêu âm'),
('Phòng X-quang', 'Phòng chụp X-quang')
ON CONFLICT (type_name) DO NOTHING;

-- 3. Rooms
INSERT INTO rooms (room_number, room_type_id, capacity, status) VALUES
-- Phòng khoa Nội
('N101', 6, 1, 'available'),
('N102', 6, 1, 'available'),
('N201', 3, 4, 'available'),
('N202', 2, 2, 'available'),

-- Phòng khoa Ngoại
('NG101', 6, 1, 'available'),
('NG201', 5, 1, 'maintenance'),
('NG202', 5, 1, 'available'),
('NG301', 2, 2, 'available'),

-- Phòng khoa Tim mạch
('TM101', 6, 1, 'available'),
('TM201', 4, 1, 'available'),
('TM301', 1, 1, 'occupied'),

-- Phòng khoa Sản Phụ khoa
('SPK101', 6, 1, 'available'),
('SPK102', 6, 1, 'available'),
('SPK201', 5, 1, 'available'),

-- Phòng khoa Nhi
('NH101', 6, 1, 'available'),
('NH201', 3, 4, 'available'),

-- Phòng Chẩn đoán hình ảnh
('CĐ101', 7, 1, 'available'),
('CĐ102', 8, 1, 'available')
ON CONFLICT (room_number) DO NOTHING;

-- ============================================================================
-- MEDICAL STAFF AND DOCTORS DATA
-- ============================================================================

-- Users for medical staff
INSERT INTO users (user_id, email, password_hash, is_active, created_at) VALUES
-- Department heads
('d1001001-0000-0000-0000-000000000001', 'bs.truongkhoanoi@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1002001-0000-0000-0000-000000000002', 'bs.truongkhoangoai@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1003001-0000-0000-0000-000000000003', 'bs.truongkhoatimmach@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1004001-0000-0000-0000-000000000004', 'bs.truongkhoasanphukhoa@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1005001-0000-0000-0000-000000000005', 'bs.truongkhoanhi@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Internal medicine doctors
('d1001002-0000-0000-0000-000000000006', 'bs.nguyenvana@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1001003-0000-0000-0000-000000000007', 'bs.tranvanb@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1001004-0000-0000-0000-000000000008', 'bs.levanthic@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Surgery doctors
('d1002002-0000-0000-0000-000000000009', 'bs.phamvand@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1002003-0000-0000-0000-000000000010', 'bs.hoangvane@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Cardiology doctors
('d1003002-0000-0000-0000-000000000011', 'bs.vuvangf@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1003003-0000-0000-0000-000000000012', 'bs.doanvang@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- OB/GYN doctors
('d1004002-0000-0000-0000-000000000013', 'bs.ngothih@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1004003-0000-0000-0000-000000000014', 'bs.buithii@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Pediatrics doctors
('d1005002-0000-0000-0000-000000000015', 'bs.lethij@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1005003-0000-0000-0000-000000000016', 'bs.phanvank@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Nurses and staff
('n1001001-0000-0000-0000-000000000017', 'yta.nguyenthil@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('n1001002-0000-0000-0000-000000000018', 'yta.tranvanm@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('a1001001-0000-0000-0000-000000000019', 'admin.system@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('p1001001-0000-0000-0000-000000000020', 'duocsi.nguyenn@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Doctors
INSERT INTO doctors (user_id, first_name, last_name, specialty, phone, email, created_at) VALUES
-- Department heads
('d1001001-0000-0000-0000-000000000001', 'BS.CKI. Nguyễn Văn', 'Hùng', 'Nội Tổng hợp', '0901234567', 'bs.truongkhoanoi@hospital.vn', NOW()),
('d1002001-0000-0000-0000-000000000002', 'BS.CKI. Trần Minh', 'Tuấn', 'Phẫu thuật Tổng hợp', '0901234568', 'bs.truongkhoangoai@hospital.vn', NOW()),
('d1003001-0000-0000-0000-000000000003', 'BS.CKI. Lê Thị', 'Mai', 'Tim mạch', '0901234569', 'bs.truongkhoatimmach@hospital.vn', NOW()),
('d1004001-0000-0000-0000-000000000004', 'BS.CKI. Phạm Thị', 'Hoa', 'Sản Phụ khoa', '0901234570', 'bs.truongkhoasanphukhoa@hospital.vn', NOW()),
('d1005001-0000-0000-0000-000000000005', 'BS.CKI. Hoàng Văn', 'Nam', 'Nhi khoa', '0901234571', 'bs.truongkhoanhi@hospital.vn', NOW()),

-- Internal medicine doctors
('d1001002-0000-0000-0000-000000000006', 'BS. Nguyễn Văn', 'An', 'Tiêu hóa', '0901234572', 'bs.nguyenvana@hospital.vn', NOW()),
('d1001003-0000-0000-0000-000000000007', 'BS. Trần Văn', 'Bình', 'Thận - Tiết niệu', '0901234573', 'bs.tranvanb@hospital.vn', NOW()),
('d1001004-0000-0000-0000-000000000008', 'BS. Lê Văn Thị', 'Cương', 'Nội tiết', '0901234574', 'bs.levanthic@hospital.vn', NOW()),

-- Surgery doctors
('d1002002-0000-0000-0000-000000000009', 'BS. Phạm Văn', 'Dũng', 'Phẫu thuật Tiêu hóa', '0901234575', 'bs.phamvand@hospital.vn', NOW()),
('d1002003-0000-0000-0000-000000000010', 'BS. Hoàng Văn', 'Em', 'Phẫu thuật Chấn thương', '0901234576', 'bs.hoangvane@hospital.vn', NOW()),

-- Cardiology doctors
('d1003002-0000-0000-0000-000000000011', 'BS. Vũ Văn', 'Phong', 'Can thiệp Tim mạch', '0901234577', 'bs.vuvangf@hospital.vn', NOW()),
('d1003003-0000-0000-0000-000000000012', 'BS. Đoàn Văn', 'Giang', 'Phẫu thuật Tim', '0901234578', 'bs.doanvang@hospital.vn', NOW()),

-- OB/GYN doctors
('d1004002-0000-0000-0000-000000000013', 'BS. Ngô Thị', 'Huệ', 'Sản khoa', '0901234579', 'bs.ngothih@hospital.vn', NOW()),
('d1004003-0000-0000-0000-000000000014', 'BS. Bùi Thị', 'Ình', 'Phụ khoa', '0901234580', 'bs.buithii@hospital.vn', NOW()),

-- Pediatrics doctors
('d1005002-0000-0000-0000-000000000015', 'BS. Lê Thị', 'Jang', 'Nhi Tiêu hóa', '0901234581', 'bs.lethij@hospital.vn', NOW()),
('d1005003-0000-0000-0000-000000000016', 'BS. Phan Văn', 'Kiên', 'Nhi Hô hấp', '0901234582', 'bs.phanvank@hospital.vn', NOW())
ON CONFLICT DO NOTHING;

-- Doctor Department mapping
INSERT INTO doctor_department (doctor_id, department_id) VALUES
-- Department heads
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
-- Internal medicine doctors
(6, 1), (7, 1), (8, 1),
-- Surgery doctors  
(9, 2), (10, 2),
-- Cardiology doctors
(11, 3), (12, 3),
-- OB/GYN doctors
(13, 4), (14, 4),
-- Pediatrics doctors
(15, 5), (16, 5)
ON CONFLICT DO NOTHING;

-- Staff (Non-doctor personnel)
INSERT INTO staff (user_id, first_name, last_name, role, position, department_id, phone, email, hire_date, created_at) VALUES
('n1001001-0000-0000-0000-000000000017', 'Y tá. Nguyễn Thị', 'Lan', 'nurse', 'Y tá trưởng khoa Nội', 1, '0987654321', 'yta.nguyenthil@hospital.vn', '2023-01-15', NOW()),
('n1001002-0000-0000-0000-000000000018', 'Y tá. Trần Văn', 'Minh', 'nurse', 'Y tá khoa Ngoại', 2, '0987654322', 'yta.tranvanm@hospital.vn', '2023-02-01', NOW()),
('a1001001-0000-0000-0000-000000000019', 'Admin. Lê Thị', 'Oanh', 'admin', 'Quản trị hệ thống', NULL, '0987654323', 'admin.system@hospital.vn', '2022-12-01', NOW()),
('p1001001-0000-0000-0000-000000000020', 'Dược sĩ. Nguyễn Văn', 'Nam', 'pharmacist', 'Dược sĩ trưởng', 10, '0987654324', 'duocsi.nguyenn@hospital.vn', '2023-03-01', NOW())
ON CONFLICT DO NOTHING;

-- User Roles mapping for medical staff
INSERT INTO user_roles (user_id, role_id, is_active) VALUES
-- Doctors get doctor role (role_id = 2)
('d1001001-0000-0000-0000-000000000001', 2, true),
('d1002001-0000-0000-0000-000000000002', 2, true),
('d1003001-0000-0000-0000-000000000003', 2, true),
('d1004001-0000-0000-0000-000000000004', 2, true),
('d1005001-0000-0000-0000-000000000005', 2, true),
('d1001002-0000-0000-0000-000000000006', 2, true),
('d1001003-0000-0000-0000-000000000007', 2, true),
('d1001004-0000-0000-0000-000000000008', 2, true),
('d1002002-0000-0000-0000-000000000009', 2, true),
('d1002003-0000-0000-0000-000000000010', 2, true),
('d1003002-0000-0000-0000-000000000011', 2, true),
('d1003003-0000-0000-0000-000000000012', 2, true),
('d1004002-0000-0000-0000-000000000013', 2, true),
('d1004003-0000-0000-0000-000000000014', 2, true),
('d1005002-0000-0000-0000-000000000015', 2, true),
('d1005003-0000-0000-0000-000000000016', 2, true),

-- Nurses get nurse role (role_id = 3)
('n1001001-0000-0000-0000-000000000017', 3, true),
('n1001002-0000-0000-0000-000000000018', 3, true),

-- Admin gets admin role (role_id = 1)
('a1001001-0000-0000-0000-000000000019', 1, true),

-- Pharmacist gets pharmacist role (role_id = 4)
('p1001001-0000-0000-0000-000000000020', 4, true)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================================================
-- SAMPLE MEDICINE DATA
-- ============================================================================

INSERT INTO medicine (name, brand, type, dosage, stock_quantity, expiry_date, created_at) VALUES
('Paracetamol', 'Hasan-Dermapharm', 'Giảm đau, hạ sốt', '500mg', 1000, '2026-12-31', NOW()),
('Ibuprofen', 'Stada', 'Chống viêm', '400mg', 500, '2026-06-30', NOW()),
('Amoxicillin', 'Imexpharm', 'Kháng sinh', '500mg', 800, '2025-12-31', NOW()),
('Cefixime', 'Stella', 'Kháng sinh', '200mg', 300, '2026-03-31', NOW()),
('Amlodipine', 'Teva', 'Hạ huyết áp', '5mg', 600, '2026-09-30', NOW()),
('Atorvastatin', 'Pfizer', 'Giảm cholesterol', '20mg', 400, '2026-08-31', NOW()),
('Omeprazole', 'AstraZeneca', 'Ức chế acid', '20mg', 700, '2026-05-31', NOW()),
('Domperidone', 'Janssen', 'Chống nôn', '10mg', 500, '2026-04-30', NOW()),
('Vitamin B complex', 'DHG Pharma', 'Vitamin', 'B1+B6+B12', 800, '2026-11-30', NOW()),
('Calcium carbonate', 'Pharmedic', 'Bổ sung Calcium', '500mg', 1200, '2026-10-31', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE PATIENT DATA
-- ============================================================================

-- Create some sample patients with user accounts
INSERT INTO users (user_id, email, password_hash, is_active, is_verified) VALUES
('p0000001-0000-0000-0000-000000000001', 'patient1@email.com', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, true),
('p0000002-0000-0000-0000-000000000002', 'patient2@email.com', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, true),
('p0000003-0000-0000-0000-000000000003', 'patient3@email.com', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, true),
('p0000004-0000-0000-0000-000000000004', 'patient4@email.com', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, true),
('p0000005-0000-0000-0000-000000000005', 'patient5@email.com', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, true)
ON CONFLICT (email) DO NOTHING;

-- Assign patient role to sample patients
INSERT INTO user_roles (user_id, role_id, is_active)
SELECT user_id, (SELECT role_id FROM roles WHERE role_name = 'patient'), true
FROM users 
WHERE user_id IN (
    'p0000001-0000-0000-0000-000000000001',
    'p0000002-0000-0000-0000-000000000002',
    'p0000003-0000-0000-0000-000000000003',
    'p0000004-0000-0000-0000-000000000004',
    'p0000005-0000-0000-0000-000000000005'
)
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Sample patients
INSERT INTO patients (patient_code, user_id, first_name, last_name, date_of_birth, gender, phone, email, address, blood_type, created_at) VALUES
('BN001', 'p0000001-0000-0000-0000-000000000001', 'Nguyễn Văn', 'A', '1980-05-15', 'male', '0912345001', 'patient1@email.com', '123 Đường ABC, Quận 1, TP.HCM', 'O+', NOW()),
('BN002', 'p0000002-0000-0000-0000-000000000002', 'Trần Thị', 'B', '1975-08-22', 'female', '0912345002', 'patient2@email.com', '456 Đường DEF, Quận 2, TP.HCM', 'A+', NOW()),
('BN003', 'p0000003-0000-0000-0000-000000000003', 'Lê Văn', 'C', '1990-12-10', 'male', '0912345003', 'patient3@email.com', '789 Đường GHI, Quận 3, TP.HCM', 'B+', NOW()),
('BN004', 'p0000004-0000-0000-0000-000000000004', 'Phạm Thị', 'D', '1985-03-28', 'female', '0912345004', 'patient4@email.com', '321 Đường JKL, Quận 4, TP.HCM', 'AB+', NOW()),
('BN005', 'p0000005-0000-0000-0000-000000000005', 'Hoàng Văn', 'E', '1992-07-14', 'male', '0912345005', 'patient5@email.com', '654 Đường MNO, Quận 5, TP.HCM', 'O-', NOW())
ON CONFLICT (patient_code) DO NOTHING;

-- ============================================================================
-- SAMPLE APPOINTMENTS
-- ============================================================================

INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, created_at) VALUES
-- Appointments with internal medicine doctors
(1, 6, '2025-09-22', '08:30:00', 'Khám tổng quát định kỳ', 'scheduled', NOW()),
(2, 7, '2025-09-22', '09:00:00', 'Đau bụng, rối loạn tiêu hóa', 'scheduled', NOW()),
(3, 8, '2025-09-23', '10:30:00', 'Theo dõi điều trị tiểu đường', 'scheduled', NOW()),

-- Appointments with cardiology doctors
(4, 11, '2025-09-24', '14:00:00', 'Khám tim mạch, đau ngực', 'scheduled', NOW()),
(5, 12, '2025-09-25', '15:30:00', 'Tái khám sau phẫu thuật tim', 'scheduled', NOW()),

-- Appointments with pediatrics doctors
(1, 15, '2025-09-23', '08:00:00', 'Khám cho con (5 tuổi) - ho, sốt', 'scheduled', NOW()),
(2, 16, '2025-09-24', '09:30:00', 'Tiêm chủng cho trẻ', 'scheduled', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE MEDICAL RECORDS
-- ============================================================================

INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment_plan, notes, created_at) VALUES
(1, 6, 1, 'Tăng huyết áp độ 1', 'Chế độ ăn ít muối, tập thể dục đều đặn', 'Amlodipine 5mg x 1 viên/ngày', NOW()),
(2, 7, 2, 'Viêm dạ dày cấp', 'Kiêng cay nóng, ăn nhẹ', 'Omeprazole 20mg x 2 lần/ngày, Domperidone 10mg x 3 lần/ngày', NOW()),
(3, 8, 3, 'Đái tháo đường type 2', 'Điều chỉnh chế độ ăn, tập thể dục', 'Metformin 500mg x 2 lần/ngày', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE BILLING RECORDS
-- ============================================================================

INSERT INTO billing (patient_id, appointment_id, total_amount, payment_status, created_at) VALUES
(1, 1, 350000, 'paid', NOW()),
(2, 2, 420000, 'pending', NOW()),
(3, 3, 280000, 'paid', NOW()),
(4, 4, 850000, 'pending', NOW()),
(5, 5, 1200000, 'pending', NOW())
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION AND STATISTICS
-- ============================================================================

-- Display statistics after insert
DO $$
DECLARE
    role_count INTEGER;
    permission_count INTEGER;
    user_count INTEGER;
    doctor_count INTEGER;
    patient_count INTEGER;
    appointment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM roles;
    SELECT COUNT(*) INTO permission_count FROM permissions;
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO doctor_count FROM doctors;
    SELECT COUNT(*) INTO patient_count FROM patients;
    SELECT COUNT(*) INTO appointment_count FROM appointments;
    
    RAISE NOTICE '=== SEED DATA STATISTICS ===';
    RAISE NOTICE 'Roles created: %', role_count;
    RAISE NOTICE 'Permissions created: %', permission_count;
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE 'Doctors created: %', doctor_count;
    RAISE NOTICE 'Patients created: %', patient_count;
    RAISE NOTICE 'Appointments created: %', appointment_count;
    RAISE NOTICE 'Migration 003 (Seed Data) completed successfully!';
END $$;

-- ============================================================================
-- END OF MIGRATION 003
-- ============================================================================
