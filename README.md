# Hospital Management System

Hệ thống quản lý bệnh viện được xây dựng với Next.js và Node.js

## Công nghệ

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Container**: Docker & Docker Compose

## Cài đặt

### Yêu cầu
- Docker & Docker Compose
- Node.js 16+ (nếu chạy local)
- Git

### Chạy với Docker (Khuyến nghị)

```bash
# Clone repository
git clone <repository-url>
cd DoAnChuyenNganh

# Backend
cd backend
cp .env.example .env  # Cấu hình env nếu cần
docker-compose -f docker-compose.dev.yml up -d

# Frontend
cd ../frontend
docker-compose -f docker-compose.dev.yml up -d
```

### Chạy local (Development)

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend
cd frontend
npm install  # hoặc pnpm install
npm run dev
```

## Truy cập

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## Tài khoản Demo

**Mật khẩu chung: `Demo1234`**

Các tài khoản sau được tạo từ seed data (`003_seed_data.sql`):

| Email | Vai trò | Mô tả |
|-------|---------|-------|
| admin@demo.com | Admin | Toàn quyền hệ thống |
| doctor@demo.com | Bác sĩ | Quản lý bệnh nhân, hồ sơ y tế |
| nurse@demo.com | Y tá | Chăm sóc bệnh nhân |
| patient@demo.com | Bệnh nhân | Xem thông tin cá nhân |
| pharmacist@demo.com | Dược sĩ | Quản lý thuốc |
| technician@demo.com | Kỹ thuật viên | Hỗ trợ kỹ thuật |
| lab@demo.com | Lab Assistant | Xét nghiệm (dùng technician role) |
| driver@demo.com | Tài xế | Vận chuyển xe cứu thương |
| worker@demo.com | Nhân viên | Vệ sinh và bảo trì |

## Tài liệu chi tiết

- [Backend Documentation](./backend/docs/README.md)
- [Setup Guide](./backend/docs/SETUP.md)
- [Security Guide](./backend/docs/SECURITY.md)

## Cấu trúc project

```
DoAnChuyenNganh/
├── backend/          # API server (Node.js + Express + Prisma)
│   ├── src/          # Source code
│   ├── prisma/       # Database schema
│   └── docs/         # Tài liệu backend
└── frontend/         # Web app (Next.js + React)
    ├── app/          # Next.js app router
    ├── components/   # React components
    └── lib/          # Utilities
```

## Lệnh thường dùng

### Backend
```bash
cd backend
npm run dev              # Development
docker-compose up -d     # Chạy với Docker
npm run prisma:studio    # Xem database
```

### Frontend
```bash
cd frontend
npm run dev              # Development
npm run build            # Build production
npm run start            # Production server
```

## Troubleshooting

**Lỗi port đã sử dụng:**
```bash
# Thay đổi port trong .env hoặc docker-compose.yml
```

**Database chưa kết nối:**
```bash
cd backend
docker-compose -f docker-compose.dev.yml up -d postgres
```

**Cần reset database:**
```bash
cd backend
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

---
© 2025 Hospital Management System
