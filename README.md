# 🏥 Hospital Management System - Backend API

> **Hệ thống quản lý bệnh viện với Node.js, Express, PostgreSQL và Prisma**  
> Version: 2025.1.0 | Cập nhật: 2025-09-09

## 📋 Tổng Quan

Backend API cho hệ thống quản lý bệnh viện với các tính năng:

- 🔐 **Authentication & Authorization** (JWT + RBAC)
- 📧 **Forgot Password** với email reset
- 👥 **User Management** (Patients, Staff, Doctors)
- 📅 **Appointment System**
- 🏥 **Department & Room Management**
- 💊 **Pharmacy & Medicine**
- 📊 **Medical Records & Billing**
- 🚑 **Ambulance Management**
- 🧹 **Cleaning Services**

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ (nếu chạy local)
- PostgreSQL 15+ (nếu chạy local)

### 1. Clone & Setup
```bash
git clone <repository-url>
cd backend

# Copy environment file
cp .env.example .env
# Chỉnh sửa .env với thông tin của bạn
```

### 2. Chạy với Docker (Khuyến nghị)
```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d
```

### 3. Database Setup
```bash
# Chạy migrations
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --all

# Kiểm tra
docker-compose -f docker-compose.dev.yml exec postgres psql -U hospital_user -d hospital_db_dev -c "\dt"
```

### 4. Kiểm Tra
- **API**: http://localhost:3000/api/v1/health
- **Swagger Docs**: http://localhost:3000/api/docs
- **pgAdmin**: http://localhost:5050

## 📚 Documentation

| Tài Liệu | Mô Tả |
|----------|--------|
| [🔧 Setup Guide](docs/SETUP.md) | Hướng dẫn setup chi tiết |
| [🔐 Security](docs/SECURITY.md) | Bảo mật và authentication |
| [📧 Forgot Password](docs/FORGOT_PASSWORD.md) | Setup chức năng quên mật khẩu |
| [🌐 Nginx](docs/NGINX.md) | Cấu hình reverse proxy |
| [🗄️ Database](docs/DATABASE.md) | Schema và migrations |
| [📡 API Reference](http://localhost:3000/api/docs) | Swagger documentation |

## 🛠️ Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # API controllers
│   ├── middleware/      # Auth, validation, security
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   └── config/         # Configuration files
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── scripts/            # Utility scripts
├── nginx/              # Nginx configuration
├── docs/               # Documentation
└── docker-compose*.yml # Docker configurations
```

### Available Scripts
```bash
# Development
npm run dev              # Start with nodemon
npm run start           # Production start

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run migrations
npm run prisma:studio   # Open Prisma Studio

# Testing & Quality
npm run test            # Run tests
npm run lint            # ESLint check
npm run lint:fix        # Fix ESLint issues
```

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hospital_db"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="24h"

# Email (for forgot password)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
FRONTEND_URL="http://localhost:3000"

# Server
PORT=3000
NODE_ENV="development"
```

## 🔐 Authentication & Security

### User Roles & Permissions
- **Admin**: Toàn quyền quản lý hệ thống
- **Doctor**: Quản lý bệnh nhân, medical records
- **Nurse**: Hỗ trợ điều trị, quản lý phòng
- **Patient**: Xem thông tin cá nhân, đặt lịch
- **Pharmacist**: Quản lý thuốc, đơn thuốc
- **Technician**: Bảo trì thiết bị
- **Driver**: Quản lý xe cứu thương
- **Worker**: Dịch vụ vệ sinh

### Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting (đặc biệt cho forgot password)
- Input validation & sanitization
- SQL injection protection
- XSS protection headers
- HTTPS/SSL support

## 📧 Forgot Password System

Hệ thống reset password an toàn với:
- ✅ Email verification với nodemailer
- ✅ Secure token (hashed, expiring)
- ✅ Rate limiting (3 requests/phút)
- ✅ Beautiful email templates
- ✅ Single-use tokens

**Setup**: Xem [docs/FORGOT_PASSWORD.md](docs/FORGOT_PASSWORD.md)

## 🗄️ Database

### Schema Overview
- **Users & Authentication**: JWT, roles, permissions
- **Medical**: Patients, doctors, appointments, records
- **Hospital**: Departments, rooms, staff
- **Services**: Pharmacy, ambulance, cleaning
- **Security**: Password reset tokens, audit logs

### Migrations
```bash
# Available migrations
001_initial_schema.sql      # Core hospital schema
002_rbac_system.sql         # Authentication & roles
003_rbac_seed_data.sql      # Default data
004_password_reset_tokens.sql # Forgot password
```

## 🌐 API Endpoints

### Authentication
```
POST /api/v1/auth/login                 # Đăng nhập
POST /api/v1/auth/register/patient      # Đăng ký bệnh nhân
POST /api/v1/auth/register/staff        # Đăng ký nhân viên
POST /api/v1/auth/forgot-password       # Quên mật khẩu
POST /api/v1/auth/reset-password        # Reset mật khẩu
GET  /api/v1/auth/me                    # Thông tin user
POST /api/v1/auth/change-password       # Đổi mật khẩu
```

### Core Resources
- `/api/v1/patients` - Quản lý bệnh nhân
- `/api/v1/doctors` - Quản lý bác sĩ
- `/api/v1/appointments` - Đặt lịch khám
- `/api/v1/medical-records` - Hồ sơ bệnh án
- `/api/v1/pharmacy` - Quản lý thuốc
- `/api/v1/rooms` - Quản lý phòng
- `/api/v1/ambulances` - Xe cứu thương

**Full API Docs**: http://localhost:3000/api/docs

## 🐳 Docker

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose up -d
```

### Services
- **backend**: Node.js API (port 3000)
- **postgres**: PostgreSQL database (port 5432)
- **redis**: Caching (port 6379)
- **nginx**: Reverse proxy (port 80, 443)
- **pgadmin**: Database GUI (port 5050)

## 🧪 Testing

```bash
# Unit tests
npm run test

# API tests
npm run test:api

# Security tests
node scripts/security-test.js
```

## 📊 Monitoring & Logs

```bash
# Application logs
docker-compose logs -f backend

# Database logs
docker-compose logs -f postgres

# Nginx logs
docker-compose logs -f nginx

# Forgot password attempts
docker-compose exec nginx tail -f /var/log/nginx/forgot_password.log
```

## 🚀 Deployment

### Production Checklist
- [ ] Cấu hình environment variables
- [ ] Setup real SSL certificates
- [ ] Cấu hình email service
- [ ] Setup monitoring & logging
- [ ] Database backup strategy
- [ ] Security audit
- [ ] Load testing

### Environment-specific Configs
- **Development**: `docker-compose.dev.yml`
- **Production**: `docker-compose.yml`
- **Nginx Dev**: `nginx/nginx.conf`
- **Nginx Prod**: `nginx/nginx-production.conf`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards
- ESLint configuration
- Prettier formatting
- Conventional commits
- Test coverage > 80%

## 📞 Support

### Common Issues
- **502 Bad Gateway**: Backend container không chạy
- **Database connection**: Kiểm tra DATABASE_URL
- **Email không gửi**: Xem [docs/FORGOT_PASSWORD.md](docs/FORGOT_PASSWORD.md)
- **Rate limiting**: Quá nhiều requests, chờ vài phút

### Troubleshooting
```bash
# Kiểm tra containers
docker-compose ps

# Xem logs
docker-compose logs backend

# Restart services
docker-compose restart

# Reset database
docker-compose down -v && docker-compose up -d
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**🏥 Hospital Management System Backend**  
Built with ❤️ using Node.js, Express, PostgreSQL, and Docker  
© 2025 Hospital Management Team