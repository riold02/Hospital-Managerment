-- ============================================================================
-- HOSPITAL SEED DATA - Migration 007
-- Tạo dữ liệu mẫu cho hệ thống bệnh viện
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
('Khoa Dược', 'Tầng trệt - Khu C');

-- 2. Users cho các bác sĩ và nhân viên
INSERT INTO users (user_id, email, password_hash, is_active, created_at) VALUES
-- Bác sĩ trưởng khoa
('d1001001-0000-0000-0000-000000000001', 'bs.truongkhoanoi@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1002001-0000-0000-0000-000000000002', 'bs.truongkhoangoai@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1003001-0000-0000-0000-000000000003', 'bs.truongkhoatimmach@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1004001-0000-0000-0000-000000000004', 'bs.truongkhoasanphukhoa@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1005001-0000-0000-0000-000000000005', 'bs.truongkhoanhi@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Các bác sĩ khoa Nội
('d1001002-0000-0000-0000-000000000006', 'bs.nguyenvana@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1001003-0000-0000-0000-000000000007', 'bs.tranvanb@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1001004-0000-0000-0000-000000000008', 'bs.levanthic@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Các bác sĩ khoa Ngoại
('d1002002-0000-0000-0000-000000000009', 'bs.phamvand@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1002003-0000-0000-0000-000000000010', 'bs.hoangvane@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Các bác sĩ khoa Tim mạch
('d1003002-0000-0000-0000-000000000011', 'bs.vuvangf@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1003003-0000-0000-0000-000000000012', 'bs.doanvang@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Các bác sĩ khoa Sản Phụ khoa
('d1004002-0000-0000-0000-000000000013', 'bs.ngothih@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1004003-0000-0000-0000-000000000014', 'bs.buithii@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Các bác sĩ khoa Nhi
('d1005002-0000-0000-0000-000000000015', 'bs.lethij@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('d1005003-0000-0000-0000-000000000016', 'bs.phanvank@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),

-- Y tá và nhân viên
('n1001001-0000-0000-0000-000000000017', 'yta.nguyenthil@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('n1001002-0000-0000-0000-000000000018', 'yta.tranvanm@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('a1001001-0000-0000-0000-000000000019', 'admin.system@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW()),
('p1001001-0000-0000-0000-000000000020', 'duocsi.nguyenn@hospital.vn', '$2a$12$KVOdu7Cgn4.s8nsDTv1R5.53svG2t2RCsk4HCThJsErURrwmanvz6', true, NOW());

-- 3. Doctors (Bác sĩ)
INSERT INTO doctors (user_id, first_name, last_name, specialty, phone, email, created_at) VALUES
-- Trưởng khoa
('d1001001-0000-0000-0000-000000000001', 'BS.CKI. Nguyễn Văn', 'Hùng', 'Nội Tổng hợp', '0901234567', 'bs.truongkhoanoi@hospital.vn', NOW()),
('d1002001-0000-0000-0000-000000000002', 'BS.CKI. Trần Minh', 'Tuấn', 'Phẫu thuật Tổng hợp', '0901234568', 'bs.truongkhoangoai@hospital.vn', NOW()),
('d1003001-0000-0000-0000-000000000003', 'BS.CKI. Lê Thị', 'Mai', 'Tim mạch', '0901234569', 'bs.truongkhoatimmach@hospital.vn', NOW()),
('d1004001-0000-0000-0000-000000000004', 'BS.CKI. Phạm Thị', 'Hoa', 'Sản Phụ khoa', '0901234570', 'bs.truongkhoasanphukhoa@hospital.vn', NOW()),
('d1005001-0000-0000-0000-000000000005', 'BS.CKI. Hoàng Văn', 'Nam', 'Nhi khoa', '0901234571', 'bs.truongkhoanhi@hospital.vn', NOW()),

-- Bác sĩ khoa Nội
('d1001002-0000-0000-0000-000000000006', 'BS. Nguyễn Văn', 'An', 'Tiêu hóa', '0901234572', 'bs.nguyenvana@hospital.vn', NOW()),
('d1001003-0000-0000-0000-000000000007', 'BS. Trần Văn', 'Bình', 'Thận - Tiết niệu', '0901234573', 'bs.tranvanb@hospital.vn', NOW()),
('d1001004-0000-0000-0000-000000000008', 'BS. Lê Văn Thị', 'Cương', 'Nội tiết', '0901234574', 'bs.levanthic@hospital.vn', NOW()),

-- Bác sĩ khoa Ngoại
('d1002002-0000-0000-0000-000000000009', 'BS. Phạm Văn', 'Dũng', 'Phẫu thuật Tiêu hóa', '0901234575', 'bs.phamvand@hospital.vn', NOW()),
('d1002003-0000-0000-0000-000000000010', 'BS. Hoàng Văn', 'Em', 'Phẫu thuật Chấn thương', '0901234576', 'bs.hoangvane@hospital.vn', NOW()),

-- Bác sĩ khoa Tim mạch
('d1003002-0000-0000-0000-000000000011', 'BS. Vũ Văn', 'Phong', 'Can thiệp Tim mạch', '0901234577', 'bs.vuvangf@hospital.vn', NOW()),
('d1003003-0000-0000-0000-000000000012', 'BS. Đoàn Văn', 'Giang', 'Phẫu thuật Tim', '0901234578', 'bs.doanvang@hospital.vn', NOW()),

-- Bác sĩ khoa Sản Phụ khoa
('d1004002-0000-0000-0000-000000000013', 'BS. Ngô Thị', 'Huệ', 'Sản khoa', '0901234579', 'bs.ngothih@hospital.vn', NOW()),
('d1004003-0000-0000-0000-000000000014', 'BS. Bùi Thị', 'Ình', 'Phụ khoa', '0901234580', 'bs.buithii@hospital.vn', NOW()),

-- Bác sĩ khoa Nhi
('d1005002-0000-0000-0000-000000000015', 'BS. Lê Thị', 'Jang', 'Nhi Tiêu hóa', '0901234581', 'bs.lethij@hospital.vn', NOW()),
('d1005003-0000-0000-0000-000000000016', 'BS. Phan Văn', 'Kiên', 'Nhi Hô hấp', '0901234582', 'bs.phanvank@hospital.vn', NOW());

-- 4. Doctor Department mapping
INSERT INTO doctor_department (doctor_id, department_id) VALUES
-- Trưởng khoa
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
-- Bác sĩ khoa Nội
(6, 1), (7, 1), (8, 1),
-- Bác sĩ khoa Ngoại  
(9, 2), (10, 2),
-- Bác sĩ khoa Tim mạch
(11, 3), (12, 3),
-- Bác sĩ khoa Sản Phụ khoa
(13, 4), (14, 4),
-- Bác sĩ khoa Nhi
(15, 5), (16, 5);

-- 5. Staff (Nhân viên)
INSERT INTO staff (user_id, first_name, last_name, role, position, department_id, phone, email, hire_date, created_at) VALUES
('n1001001-0000-0000-0000-000000000017', 'Y tá. Nguyễn Thị', 'Lan', 'NURSE', 'Y tá trưởng khoa Nội', 1, '0987654321', 'yta.nguyenthil@hospital.vn', '2023-01-15', NOW()),
('n1001002-0000-0000-0000-000000000018', 'Y tá. Trần Văn', 'Minh', 'NURSE', 'Y tá khoa Ngoại', 2, '0987654322', 'yta.tranvanm@hospital.vn', '2023-02-01', NOW()),
('a1001001-0000-0000-0000-000000000019', 'Admin. Lê Thị', 'Oanh', 'ADMIN', 'Quản trị hệ thống', NULL, '0987654323', 'admin.system@hospital.vn', '2022-12-01', NOW()),
('p1001001-0000-0000-0000-000000000020', 'Dược sĩ. Nguyễn Văn', 'Nam', 'STAFF', 'Dược sĩ trưởng', 10, '0987654324', 'duocsi.nguyenn@hospital.vn', '2023-03-01', NOW());

-- 6. User Roles mapping
INSERT INTO user_roles (user_id, role_id, is_active) VALUES
-- Bác sĩ được role doctor (role_id = 2)
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

-- Nurse được role nurse (role_id = 3)
('n1001001-0000-0000-0000-000000000017', 3, true),
('n1001002-0000-0000-0000-000000000018', 3, true),

-- Admin được role admin (role_id = 1)
('a1001001-0000-0000-0000-000000000019', 1, true),

-- Staff được role staff (role_id = 4)
('p1001001-0000-0000-0000-000000000020', 4, true);

-- 7. Room Types
INSERT INTO room_types (room_type_name, description) VALUES
('Phòng đơn VIP', 'Phòng điều trị đơn cao cấp với đầy đủ tiện nghi'),
('Phòng đôi', 'Phòng điều trị 2 giường bệnh'),
('Phòng 4 giường', 'Phòng điều trị tập thể 4 giường'),
('Phòng ICU', 'Phòng hồi sức tích cực'),
('Phòng mổ', 'Phòng phẫu thuật vô trùng'),
('Phòng khám', 'Phòng khám bệnh và tư vấn'),
('Phòng siêu âm', 'Phòng chẩn đoán hình ảnh siêu âm'),
('Phòng X-quang', 'Phòng chụp X-quang');

-- 8. Rooms
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
('CĐ102', 8, 1, 'available');

-- 9. Sample Medicine
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
('Calcium carbonate', 'Pharmedic', 'Bổ sung Calcium', '500mg', 1200, '2026-10-31', NOW());

-- 10. Sample Appointments (Một số lịch hẹn mẫu) - Sử dụng purpose thay vì reason
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, purpose, status, created_at) VALUES
-- Lịch hẹn với bác sĩ khoa Nội
(4, 6, '2025-09-22', '08:30:00', 'Khám tổng quát định kỳ', 'Scheduled', NOW()),
(5, 7, '2025-09-22', '09:00:00', 'Đau bụng, rối loạn tiêu hóa', 'Scheduled', NOW()),
(6, 8, '2025-09-23', '10:30:00', 'Theo dõi điều trị tiểu đường', 'Scheduled', NOW()),

-- Lịch hẹn với bác sĩ khoa Tim mạch
(7, 11, '2025-09-24', '14:00:00', 'Khám tim mạch, đau ngực', 'Scheduled', NOW()),
(8, 12, '2025-09-25', '15:30:00', 'Tái khám sau phẫu thuật tim', 'Scheduled', NOW()),

-- Lịch hẹn với bác sĩ khoa Nhi
(4, 15, '2025-09-23', '08:00:00', 'Khám cho con (5 tuổi) - ho, sốt', 'Scheduled', NOW()),
(5, 16, '2025-09-24', '09:30:00', 'Tiêm chủng cho trẻ', 'Scheduled', NOW());

-- 11. Medical Records mẫu
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, treatment, prescription, created_at) VALUES
(4, 6, 1, 'Tăng huyết áp độ 1', 'Chế độ ăn ít muối, tập thể dục đều đặn', 'Amlodipine 5mg x 1 viên/ngày', NOW()),
(5, 7, 2, 'Viêm dạ dày cấp', 'Kiêng cay nóng, ăn nhẹ', 'Omeprazole 20mg x 2 lần/ngày, Domperidone 10mg x 3 lần/ngày', NOW()),
(6, 8, 3, 'Đái tháo đường type 2', 'Điều chỉnh chế độ ăn, tập thể dục', 'Metformin 500mg x 2 lần/ngày', NOW());

-- 12. Billing mẫu
INSERT INTO billing (patient_id, appointment_id, total_amount, payment_status, created_at) VALUES
(4, 1, 350000, 'Paid', NOW()),
(5, 2, 420000, 'Pending', NOW()),
(6, 3, 280000, 'Paid', NOW()),
(7, 4, 850000, 'Pending', NOW()),
(8, 5, 1200000, 'Pending', NOW());

-- ============================================================================
-- Kết thúc seed data
-- ============================================================================

-- Hiển thị thống kê sau khi insert
SELECT 'Departments' as table_name, COUNT(*) as record_count FROM departments
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'Staff', COUNT(*) FROM staff  
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Medicine', COUNT(*) FROM medicine
UNION ALL
SELECT 'Appointments', COUNT(*) FROM appointments
UNION ALL
SELECT 'Medical Records', COUNT(*) FROM medical_records
UNION ALL
SELECT 'Billing', COUNT(*) FROM billing;