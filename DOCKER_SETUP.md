# Hospital Management System - Docker Setup

Hướng dẫn chạy Hospital Management System bằng Docker Compose.

## 📋 Yêu cầu hệ thống

- Docker Desktop
- Docker Compose
- Git

## 🚀 Cách chạy ứng dụng

### 1. Development Mode (Phát triển)

```powershell
# Di chuyển vào thư mục backend
cd "d:\DoAnChuyenNganh\backend"

# Khởi chạy tất cả services trong chế độ development
docker-compose -f docker-compose.dev.yml up --build -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f

# Dừng services
docker-compose -f docker-compose.dev.yml down
```

### 2. Production Mode (Sản xuất)

```powershell
# Di chuyển vào thư mục backend
cd "d:\DoAnChuyenNganh\backend"

# Khởi chạy tất cả services trong chế độ production
docker-compose up --build -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

## 🌐 Truy cập ứng dụng

### Development Mode
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs
- **pgAdmin**: http://localhost:5050
- **Nginx**: http://localhost:80

### Production Mode
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001
- **pgAdmin**: http://localhost:5050
- **Nginx**: http://localhost:80

## 🗄️ Database

### Development
- **Host**: localhost
- **Port**: 5432
- **Database**: hospital_db_dev
- **Username**: hospital_user
- **Password**: hospital_password

### Production
- **Host**: localhost
- **Port**: 5432
- **Database**: hospital_db
- **Username**: hospital_user
- **Password**: hospital_secure_password_2025

### pgAdmin Login
- **Email**: admin@hospital.com
- **Password**: admin123

## 🔧 Các lệnh hữu ích

### Kiểm tra trạng thái containers
```powershell
# Development
docker-compose -f docker-compose.dev.yml ps

# Production
docker-compose ps
```

### Xem logs của service cụ thể
```powershell
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

### Restart service cụ thể
```powershell
# Restart backend
docker-compose restart backend

# Restart frontend
docker-compose restart frontend
```

### Chạy Prisma migrations
```powershell
# Vào container backend
docker-compose exec backend sh

# Chạy migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Dọn dẹp Docker
```powershell
# Dừng và xóa containers, networks
docker-compose down

# Dừng và xóa containers, networks, volumes
docker-compose down -v

# Dừng và xóa containers, networks, images
docker-compose down --rmi all
```

## 🔍 Troubleshooting

### Port đã được sử dụng
Nếu port bị chiếm, thay đổi port trong file docker-compose:
```yaml
ports:
  - "3003:3000"  # Thay đổi port bên trái
```

### Database connection error
1. Kiểm tra PostgreSQL container đã chạy:
   ```powershell
   docker-compose ps postgres
   ```

2. Kiểm tra logs PostgreSQL:
   ```powershell
   docker-compose logs postgres
   ```

### Frontend không kết nối được Backend
1. Kiểm tra biến môi trường `NEXT_PUBLIC_API_URL` trong frontend
2. Đảm bảo backend container đã chạy trước frontend

### Build lỗi
1. Xóa images cũ:
   ```powershell
   docker-compose down --rmi all
   ```

2. Build lại:
   ```powershell
   docker-compose up --build
   ```

## 📝 Environment Variables

### Backend (.env.development)
```env
NODE_ENV=development
DATABASE_URL=postgresql://hospital_user:hospital_password@postgres:5432/hospital_db_dev?schema=public
JWT_SECRET=dev-jwt-secret-key-not-for-production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │    Frontend     │    │    Backend      │
│   (Port 80)     │────│   (Port 3002)   │────│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │   PostgreSQL    │
                                               │   (Port 5432)   │
                                               └─────────────────┘
```