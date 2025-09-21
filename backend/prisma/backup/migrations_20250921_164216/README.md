# Database Migrations

Thư mục này chứa các file migration SQL để quản lý schema database của Hospital Management System.

## 📋 Danh sách Migrations

### 001_initial_schema.sql
- **Mục đích**: Tạo schema ban đầu cho hệ thống quản lý bệnh viện
- **Nội dung**:
  - Tất cả bảng cốt lõi (departments, rooms, staff, patients, doctors, etc.)
  - Bảng quản lý y tế (appointments, medical_records, prescriptions, medicine)
  - Bảng vận hành (room_assignments, billing, pharmacy_records, ambulances, cleaning_service)
  - Indexes để tối ưu hiệu suất
  - Triggers cho updated_at timestamps
- **Dependencies**: Không có
- **Tạo**: 2025-09-09

### 002_rbac_system.sql
- **Mục đích**: Thêm hệ thống Role-Based Access Control (RBAC)
- **Nội dung**:
  - Bảng RBAC (users, roles, permissions, user_roles, role_permissions)
  - Tích hợp với bảng staff và patients thông qua user_id
  - Triggers tự động sync user_id và permissions
  - Row Level Security (RLS) policies
  - Indexes cho hiệu suất RBAC
- **Dependencies**: 001_initial_schema.sql
- **Tạo**: 2025-09-09

### 004_password_reset_tokens.sql
- **Mục đích**: Thêm hệ thống reset password an toàn
- **Nội dung**:
  - Bảng password_reset_tokens với token hashing
  - Expiration time và used_at tracking
  - Indexes để tối ưu tra cứu token
  - Security measures cho password reset flow
- **Dependencies**: 002_rbac_system.sql
- **Tạo**: 2025-09-09

### 005_link_user_business_tables.sql
- **Mục đích**: Liên kết hoàn thiện user system với business tables
- **Nội dung**:
  - Thêm user_id references cho doctors, ambulance drivers
  - Tracking user cho medical_records, prescriptions, billing
  - User tracking cho pharmacy, room_assignments, cleaning_service
  - Indexes cho tất cả relationships mới
- **Dependencies**: 002_rbac_system.sql
- **Tạo**: 2025-01-27

### 006_sync_current_state.sql
- **Mục đích**: Đồng bộ hóa migrations với trạng thái database hiện tại
- **Nội dung**:
  - Cập nhật cấu trúc bảng staff (employee_id, salary, is_active)
  - Thêm bảng ambulances và ambulance_logs
  - Bảng prescription_items và pharmacy_records
  - Cập nhật medicine, appointments, medical_records, billing
  - Thêm indexes và triggers cho các bảng mới
  - Data migrations cho dữ liệu hiện có
- **Dependencies**: 005_link_user_business_tables.sql
- **Tạo**: 2025-09-21

## 🚀 Cách chạy Migrations

### Trong Docker Environment

```bash
# 1. Vào thư mục backend
cd backend

# 2. Chạy tất cả migrations theo thứ tự
docker-compose exec backend bash -c "
  cd /app &&
  psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/001_initial_schema.sql &&
  psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/002_rbac_system.sql &&
  psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/003_rbac_seed_data.sql &&
  psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/004_password_reset_tokens.sql &&
  psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/005_link_user_business_tables.sql &&
  psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/006_sync_current_state.sql
"

# 3. Hoặc chạy từng file riêng lẻ
docker-compose exec backend psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/001_initial_schema.sql
docker-compose exec backend psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/002_rbac_system.sql
docker-compose exec backend psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/003_rbac_seed_data.sql
docker-compose exec backend psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/004_password_reset_tokens.sql
docker-compose exec backend psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/005_link_user_business_tables.sql
docker-compose exec backend psql postgresql://hospital_user:hospital_pass@postgres:5432/hospital_db -f prisma/migrations/006_sync_current_state.sql
```

### Trực tiếp từ PostgreSQL Container

```bash
# Copy files vào container
docker cp backend/prisma/migrations hospital_postgres:/tmp/migrations

# Chạy migrations
docker exec hospital_postgres psql -U hospital_user -d hospital_db -f /tmp/migrations/001_initial_schema.sql
docker exec hospital_postgres psql -U hospital_user -d hospital_db -f /tmp/migrations/002_rbac_system.sql
docker exec hospital_postgres psql -U hospital_user -d hospital_db -f /tmp/migrations/003_rbac_seed_data.sql
docker exec hospital_postgres psql -U hospital_user -d hospital_db -f /tmp/migrations/004_password_reset_tokens.sql
docker exec hospital_postgres psql -U hospital_user -d hospital_db -f /tmp/migrations/005_link_user_business_tables.sql
docker exec hospital_postgres psql -U hospital_user -d hospital_db -f /tmp/migrations/006_sync_current_state.sql
```

## 🔐 Default Users sau khi Migration

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| admin@hospital.com | admin123 | admin | System Administrator |
| doctor@hospital.com | admin123 | doctor | Demo Doctor |
| nurse@hospital.com | admin123 | nurse | Demo Nurse |
| pharmacist@hospital.com | admin123 | pharmacist | Demo Pharmacist |
| patient@hospital.com | admin123 | patient | Demo Patient |

## 🛡️ Security Features

### Row Level Security (RLS)
- **Enabled trên**: users, staff, patients, medical_records, appointments, prescriptions, billing
- **Policies**: Users chỉ có thể truy cập dữ liệu của họ hoặc dữ liệu được phép theo role

### RBAC System
- **8 Roles**: admin, doctor, nurse, pharmacist, technician, driver, worker, patient
- **50+ Permissions**: Chi tiết theo resource:action pattern
- **Automatic Role Assignment**: Triggers tự động assign roles khi tạo staff/patient

## 🔧 Maintenance

### Rollback Migration
```sql
-- Rollback migration 003
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
ALTER TABLE staff DROP COLUMN IF EXISTS user_id;
ALTER TABLE patients DROP COLUMN IF EXISTS user_id;

-- Rollback migration 002
DROP TABLE IF EXISTS users CASCADE;
-- (thêm các lệnh rollback khác nếu cần)
```

### Check Migration Status
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check RBAC data
SELECT 'Roles' as type, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles;
```

## 📝 Notes

- **Thứ tự quan trọng**: Phải chạy migrations theo đúng thứ tự (001 → 002 → 003)
- **Idempotent**: Các migrations sử dụng `IF NOT EXISTS` và `ON CONFLICT` để có thể chạy nhiều lần an toàn
- **Backup**: Nên backup database trước khi chạy migrations trong production
- **Testing**: Test migrations trên development environment trước

## 🔍 Troubleshooting

### Lỗi thường gặp:

1. **"relation already exists"**
   - Nguyên nhân: Migration đã chạy trước đó
   - Giải pháp: Migrations sử dụng `IF NOT EXISTS`, có thể ignore error này

2. **"database does not exist"**
   - Nguyên nhân: Database chưa được tạo
   - Giải pháp: Tạo database trước: `CREATE DATABASE hospital;`

3. **"permission denied"**
   - Nguyên nhân: User không có quyền
   - Giải pháp: Sử dụng user postgres hoặc user có quyền admin

4. **"connection refused"**
   - Nguyên nhân: PostgreSQL chưa chạy hoặc sai connection string
   - Giải pháp: Kiểm tra Docker containers và connection string
