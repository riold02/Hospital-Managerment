# 📚 Hospital Management System - Documentation

> **Tài liệu hướng dẫn hoàn chỉnh cho Hospital Management System Backend**

## 📋 Tổng Quan

Thư mục này chứa tất cả tài liệu hướng dẫn cho hệ thống Hospital Management System Backend, được tổ chức theo chủ đề để dễ tìm kiếm và sử dụng.

## 📁 Cấu Trúc Tài Liệu

| Tài Liệu | Mô Tả | Dành Cho |
|----------|--------|----------|
| [🔧 SETUP.md](SETUP.md) | Hướng dẫn cài đặt và cấu hình | Developers, DevOps |
| [🔐 SECURITY.md](SECURITY.md) | Bảo mật và authentication | Security Engineers |
| [📧 FORGOT_PASSWORD.md](FORGOT_PASSWORD.md) | Setup chức năng quên mật khẩu | Developers |
| [🌐 NGINX.md](NGINX.md) | Cấu hình reverse proxy | DevOps, SysAdmin |
| [🗄️ DATABASE.md](DATABASE.md) | Database schema và operations | Database Admins |

## 🚀 Quick Start

### Cho Developers Mới
1. **Bắt đầu**: Đọc [SETUP.md](SETUP.md) để cài đặt môi trường
2. **Bảo mật**: Tham khảo [SECURITY.md](SECURITY.md) để hiểu hệ thống auth
3. **Database**: Xem [DATABASE.md](DATABASE.md) để hiểu cấu trúc dữ liệu

### Cho DevOps Engineers
1. **Setup**: [SETUP.md](SETUP.md) - Production deployment
2. **Proxy**: [NGINX.md](NGINX.md) - Load balancing và SSL
3. **Security**: [SECURITY.md](SECURITY.md) - Security monitoring

### Cho System Administrators
1. **Infrastructure**: [SETUP.md](SETUP.md) - Docker và services
2. **Database**: [DATABASE.md](DATABASE.md) - Backup và maintenance
3. **Security**: [SECURITY.md](SECURITY.md) - Incident response

## 📖 Chi Tiết Tài Liệu

### 🔧 [SETUP.md](SETUP.md)
**Hướng dẫn cài đặt và cấu hình hệ thống**
- ✅ Docker setup (development & production)
- ✅ Environment configuration
- ✅ Database migrations
- ✅ Email service setup
- ✅ Troubleshooting guide

### 🔐 [SECURITY.md](SECURITY.md)
**Bảo mật và authentication system**
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting configuration
- ✅ Input validation & XSS protection
- ✅ Security monitoring & incident response

### 📧 [FORGOT_PASSWORD.md](FORGOT_PASSWORD.md)
**Chức năng quên mật khẩu với email**
- ✅ Nodemailer configuration
- ✅ Secure token generation
- ✅ Email templates (responsive)
- ✅ Rate limiting for security
- ✅ Testing và troubleshooting

### 🌐 [NGINX.md](NGINX.md)
**Nginx reverse proxy và load balancing**
- ✅ SSL/HTTPS configuration
- ✅ Rate limiting rules
- ✅ Security headers
- ✅ Static file serving
- ✅ Production deployment

### 🗄️ [DATABASE.md](DATABASE.md)
**Database schema, migrations và operations**
- ✅ PostgreSQL + Prisma setup
- ✅ Migration system
- ✅ Security features (RLS, encryption)
- ✅ Performance optimization
- ✅ Backup & monitoring

## 🔍 Tìm Kiếm Nhanh

### Authentication & Security
- **JWT Setup**: [SECURITY.md](SECURITY.md#authentication-system)
- **User Roles**: [SECURITY.md](SECURITY.md#role-based-access-control-rbac)
- **Password Security**: [SECURITY.md](SECURITY.md#password-security)
- **Forgot Password**: [FORGOT_PASSWORD.md](FORGOT_PASSWORD.md)

### Infrastructure & Deployment
- **Docker Setup**: [SETUP.md](SETUP.md#docker-setup)
- **Production Deploy**: [SETUP.md](SETUP.md#production-deployment)
- **Nginx Config**: [NGINX.md](NGINX.md)
- **SSL Certificates**: [NGINX.md](NGINX.md#ssl-certificates)

### Database & Data
- **Schema Overview**: [DATABASE.md](DATABASE.md#database-architecture)
- **Migrations**: [DATABASE.md](DATABASE.md#migration-system)
- **Backup/Restore**: [DATABASE.md](DATABASE.md#backup--restore)
- **Performance**: [DATABASE.md](DATABASE.md#performance-optimization)

### Troubleshooting
- **Common Issues**: [SETUP.md](SETUP.md#troubleshooting)
- **Database Problems**: [DATABASE.md](DATABASE.md#troubleshooting)
- **Security Incidents**: [SECURITY.md](SECURITY.md#incident-response)
- **Email Issues**: [FORGOT_PASSWORD.md](FORGOT_PASSWORD.md#troubleshooting)

## 🆘 Support & Help

### Khi Gặp Vấn Đề
1. **Kiểm tra logs**: `docker-compose logs -f backend`
2. **Xem troubleshooting**: Mỗi tài liệu có section riêng
3. **Check health**: `curl http://localhost:3000/api/v1/health`
4. **Community**: Tạo issue trên GitHub

### Liên Hệ
- **Technical Issues**: GitHub Issues
- **Security Concerns**: security@hospital.com
- **Documentation**: docs@hospital.com

## 📝 Đóng Góp

### Cập Nhật Tài Liệu
1. Fork repository
2. Cập nhật tài liệu tương ứng
3. Test hướng dẫn (nếu có)
4. Tạo Pull Request

### Quy Tắc Viết
- ✅ Sử dụng tiếng Việt cho nội dung chính
- ✅ Code examples bằng tiếng Anh
- ✅ Có ví dụ cụ thể và screenshots
- ✅ Cập nhật version và ngày tháng
- ✅ Test hướng dẫn trước khi submit

## 🔄 Cập Nhật Gần Đây

| Ngày | Tài Liệu | Thay Đổi |
|------|----------|-----------|
| 2025-09-09 | All | Tối ưu cấu trúc documentation |
| 2025-09-09 | FORGOT_PASSWORD.md | Thêm chức năng quên mật khẩu |
| 2025-09-09 | NGINX.md | Cấu hình reverse proxy |
| 2025-09-09 | SECURITY.md | Cập nhật security guidelines |

---

📚 **Hospital Management System Documentation**  
Maintained by Development Team  
© 2025 Hospital Management Team
