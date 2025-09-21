# Optimized Hospital Management System Migrations

## Tổng quan

Thư mục này chứa các migration đã được tối ưu hóa và đồng bộ hóa cho Hệ thống Quản lý Bệnh viện. Các migration này đã được thiết kế lại từ đầu để đảm bảo tính nhất quán, hiệu suất và khả năng bảo trì.

## Cấu trúc Migration

### 001_initial_schema.sql
**Mô tả**: Schema cơ bản của hệ thống bệnh viện  
**Chức năng**:
- Tạo tất cả các bảng cơ bản: departments, rooms, staff, patients, doctors, appointments, medical_records, medicine, prescriptions, billing, ambulances, cleaning_service
- Thiết lập các ràng buộc, indexes và triggers
- Tạo các bảng liên kết như doctor_department, prescription_items
- Đảm bảo tính toàn vẹn dữ liệu với foreign keys và check constraints

**Các bảng chính**:
- `departments` - Khoa/phòng ban
- `room_types`, `rooms` - Quản lý phòng
- `staff`, `doctors` - Nhân viên và bác sĩ
- `patients` - Bệnh nhân
- `appointments` - Lịch hẹn
- `medical_records` - Hồ sơ bệnh án
- `medicine`, `prescriptions`, `prescription_items` - Quản lý thuốc
- `billing` - Thanh toán
- `ambulances`, `ambulance_log` - Xe cứu thương
- `cleaning_service` - Dịch vụ vệ sinh

### 002_rbac_system.sql
**Mô tả**: Hệ thống phân quyền dựa trên vai trò (RBAC)  
**Chức năng**:
- Tạo bảng users, roles, permissions, user_roles, role_permissions
- Tích hợp user_id vào tất cả các bảng nghiệp vụ
- Thiết lập Row Level Security (RLS) policies
- Tạo triggers tự động đồng bộ user_id
- Tạo views và functions hỗ trợ truy vấn

**Các bảng RBAC**:
- `users` - Người dùng hệ thống
- `roles` - Vai trò (admin, doctor, nurse, patient, v.v.)
- `permissions` - Quyền hạn chi tiết
- `user_roles` - Liên kết user-role
- `role_permissions` - Liên kết role-permission
- `password_reset_tokens` - Token reset mật khẩu

**Tích hợp nghiệp vụ**:
- Thêm `user_id` vào các bảng: staff, patients, doctors
- Thêm tracking fields: `created_by_user_id`, `processed_by_user_id`, v.v.
- RLS policies cho bảo mật dữ liệu

### 003_seed_data.sql
**Mô tả**: Dữ liệu mẫu và khởi tạo hệ thống  
**Chức năng**:
- Tạo các roles và permissions cơ bản
- Tạo tài khoản admin và demo users
- Thêm dữ liệu mẫu: departments, doctors, patients, appointments
- Phân quyền cho từng role

**Dữ liệu khởi tạo**:
- 8 roles: admin, doctor, nurse, pharmacist, technician, driver, worker, patient
- 40+ permissions chi tiết
- Tài khoản admin mặc định
- 10 khoa bệnh viện
- 16 bác sĩ mẫu
- 5 bệnh nhân mẫu
- Dữ liệu thuốc, lịch hẹn, hóa đơn mẫu

## Cải tiến so với Migration cũ

### 1. Tính nhất quán
- ✅ Thống nhất tên bảng và cột
- ✅ Chuẩn hóa data types và constraints
- ✅ Đồng bộ với Prisma schema

### 2. Hiệu suất
- ✅ Indexes được tối ưu
- ✅ Constraints và validations đầy đủ
- ✅ Triggers được tối ưu

### 3. Bảo mật
- ✅ Row Level Security (RLS)
- ✅ Password hashing
- ✅ Token-based password reset

### 4. Khả năng bảo trì
- ✅ Documentation đầy đủ
- ✅ Validation queries
- ✅ Error handling

## Cách sử dụng

### 1. Backup dữ liệu hiện tại (nếu có)
```bash
pg_dump -h localhost -U postgres -d hospital_db > backup_$(date +%Y%m%d).sql
```

### 2. Chạy migrations theo thứ tự
```bash
# 1. Schema cơ bản
psql -h localhost -U postgres -d hospital_db -f 001_initial_schema.sql

# 2. Hệ thống RBAC
psql -h localhost -U postgres -d hospital_db -f 002_rbac_system.sql

# 3. Dữ liệu mẫu
psql -h localhost -U postgres -d hospital_db -f 003_seed_data.sql
```

### 3. Kiểm tra kết quả
```sql
-- Kiểm tra số lượng bảng
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';

-- Kiểm tra dữ liệu mẫu
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Doctors', COUNT(*) FROM doctors
UNION ALL
SELECT 'Patients', COUNT(*) FROM patients;
```

## Tài khoản Demo

| Role | Email | Password | Mô tả |
|------|-------|----------|--------|
| Admin | admin@hospital.com | admin123 | Quản trị hệ thống |
| Doctor | doctor@hospital.com | admin123 | Bác sĩ demo |
| Nurse | nurse@hospital.com | admin123 | Y tá demo |
| Pharmacist | pharmacist@hospital.com | admin123 | Dược sĩ demo |
| Patient | patient@hospital.com | admin123 | Bệnh nhân demo |

## Lưu ý quan trọng

1. **Môi trường Production**: Thay đổi mật khẩu mặc định trước khi deploy
2. **Database Backup**: Luôn backup trước khi chạy migration
3. **Testing**: Test kỹ trên môi trường dev trước khi apply lên production
4. **Monitoring**: Theo dõi performance sau khi migration

## Troubleshooting

### Lỗi thường gặp

1. **Foreign key constraint fails**
   - Kiểm tra dữ liệu tồn tại trước khi tạo reference
   - Chạy migrations theo đúng thứ tự

2. **Duplicate key error**
   - Xóa dữ liệu cũ xung đột
   - Sử dụng ON CONFLICT clauses

3. **Permission denied**
   - Đảm bảo user có quyền CREATE TABLE
   - Kiểm tra RLS policies

### Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs PostgreSQL
2. Xem file backup đã tạo trước đó
3. Liên hệ team dev để hỗ trợ

---

**Ngày tạo**: 2025-09-21  
**Phiên bản**: 1.0.0  
**Tương thích**: PostgreSQL 12+, Prisma 5+
