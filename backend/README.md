# Hospital Management System - Backend

API Server cho hệ thống quản lý bệnh viện

## Cài đặt nhanh

```bash
# Clone và vào thư mục
git clone <repo-url>
cd backend

# Cấu hình env
cp .env.example .env
# Chỉnh sửa file .env với thông tin của bạn

# Chạy với Docker
docker-compose -f docker-compose.dev.yml up -d

# Hoặc chạy local
npm install
npm run dev
```

## Environment Variables

Tạo file `.env` với nội dung:
```env
DATABASE_URL="postgresql://user:password@postgres:5432/hospital_db_dev"
JWT_SECRET="your-secret-key"
PORT=3001
NODE_ENV="development"
```

## API Endpoints

- Health: `GET /api/v1/health`
- Auth: `POST /api/v1/auth/login`
- Docs: `http://localhost:3001/api/docs`

## Demo Accounts (from 003_seed_data.sql)

All demo accounts use password: `Demo1234`

- admin@demo.com - Admin
- doctor@demo.com - Doctor  
- nurse@demo.com - Nurse
- patient@demo.com - Patient
- pharmacist@demo.com - Pharmacist
- technician@demo.com - Technician
- lab@demo.com - Lab Assistant
- driver@demo.com - Driver
- worker@demo.com - Worker

## Tài liệu

Xem thêm tại [docs/README.md](./docs/README.md)
