# 🌐 Hướng Dẫn Setup Nginx cho Hospital Management System

## 📋 Tổng Quan

Nginx được cấu hình làm reverse proxy với các tính năng:

- ✅ Reverse proxy cho Backend API và Frontend
- ✅ Rate limiting cho bảo mật (đặc biệt forgot password)
- ✅ SSL/HTTPS support
- ✅ Gzip compression
- ✅ Security headers
- ✅ Static file serving
- ✅ Load balancing ready

## 📁 Cấu Trúc File

```
nginx/
├── nginx.conf              # Development configuration
├── nginx-production.conf   # Production configuration
├── ssl/
│   ├── generate-ssl.sh     # Script tạo SSL certificates
│   ├── README.md           # Hướng dẫn SSL
│   ├── server.crt          # SSL certificate (sẽ tạo)
│   └── server.key          # SSL private key (sẽ tạo)
└── NGINX_SETUP.md          # File này
```

## 🚀 Setup Development

### 1. Tạo SSL Certificates

```bash
# Trong Docker container nginx
docker-compose exec nginx bash /etc/nginx/ssl/generate-ssl.sh
```

### 2. Chạy với Docker Compose

```bash
# Development
docker-compose -f docker-compose.dev.yml up -d

# Production
docker-compose up -d
```

### 3. Kiểm Tra

- HTTP: http://localhost
- HTTPS: https://localhost (chấp nhận self-signed certificate)
- Admin: http://localhost:8080
- Nginx Status: http://localhost:8080/nginx_status

## 🔧 Cấu Hình Chi Tiết

### Rate Limiting

| Endpoint | Limit | Burst | Mục đích |
|----------|-------|-------|----------|
| `/api/` | 10 req/s | 20 | API chung |
| `/api/v1/auth/login` | 5 req/m | 5 | Đăng nhập |
| `/api/v1/auth/forgot-password` | 3 req/m | 2 | Quên mật khẩu |
| `/api/v1/auth/reset-password` | 5 req/m | 3 | Reset mật khẩu |

### Upstream Servers

```nginx
upstream backend_api {
    server backend:3000 max_fails=3 fail_timeout=30s;
    # Thêm server khác cho load balancing:
    # server backend2:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_app {
    server frontend:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}
```

### Security Headers

```nginx
# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Content Type Options
add_header X-Content-Type-Options "nosniff" always;

# Frame Options
add_header X-Frame-Options "SAMEORIGIN" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; ..." always;
```

## 🔒 Bảo Mật

### Rate Limiting cho Forgot Password

Cấu hình đặc biệt nghiêm ngặt:

```nginx
location /api/v1/auth/forgot-password {
    limit_req zone=forgot_password burst=2 nodelay;
    
    # Log tất cả attempts
    access_log /var/log/nginx/forgot_password.log main;
    
    # Proxy settings...
}
```

### Upload File Security

```nginx
location /uploads/ {
    # Prevent execution of uploaded files
    location ~* \.(php|jsp|pl|py|asp|sh|cgi)$ {
        deny all;
    }
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
}
```

### Hidden Files Protection

```nginx
# Deny access to hidden files
location ~ /\. {
    deny all;
    log_not_found off;
    access_log off;
}

# Block common attack patterns
location ~* \.(sql|bak|backup|config|conf|ini|log)$ {
    deny all;
}
```

## 📊 Monitoring

### Nginx Status

Truy cập: http://localhost:8080/nginx_status

```
Active connections: 1 
server accepts handled requests
 1 1 1 
Reading: 0 Writing: 1 Waiting: 0
```

### Log Files

```bash
# Access logs
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Error logs
docker-compose exec nginx tail -f /var/log/nginx/error.log

# Forgot password attempts
docker-compose exec nginx tail -f /var/log/nginx/forgot_password.log
```

## 🔧 Troubleshooting

### Lỗi "502 Bad Gateway"

```bash
# Kiểm tra backend đang chạy
docker-compose ps

# Kiểm tra logs
docker-compose logs backend
docker-compose logs nginx
```

### Lỗi "413 Request Entity Too Large"

Tăng `client_max_body_size` trong nginx.conf:

```nginx
client_max_body_size 100M;
```

### Lỗi SSL Certificate

```bash
# Tạo lại certificates
docker-compose exec nginx bash /etc/nginx/ssl/generate-ssl.sh

# Restart nginx
docker-compose restart nginx
```

### Rate Limiting Quá Nghiêm

Chỉnh sửa zones trong nginx.conf:

```nginx
# Tăng rate limit
limit_req_zone $binary_remote_addr zone=api:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;
```

## 🚀 Production Deployment

### 1. Sử dụng Real SSL Certificates

```bash
# Let's Encrypt
certbot certonly --webroot -w /var/www/html -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /path/to/nginx/ssl/server.crt
cp /etc/letsencrypt/live/your-domain.com/privkey.pem /path/to/nginx/ssl/server.key
```

### 2. Cập nhật Domain

Sửa `server_name` trong nginx-production.conf:

```nginx
server_name your-domain.com www.your-domain.com;
```

### 3. Chuyển sang Production Config

```bash
# Copy production config
cp nginx/nginx-production.conf nginx/nginx.conf

# Restart
docker-compose restart nginx
```

### 4. Setup Basic Auth cho Admin

```bash
# Tạo htpasswd file
htpasswd -c /path/to/nginx/.htpasswd admin

# Mount vào container
volumes:
  - ./nginx/.htpasswd:/etc/nginx/.htpasswd:ro
```

## 📈 Performance Tuning

### Worker Processes

```nginx
worker_processes auto;  # Tự động theo CPU cores
worker_rlimit_nofile 65535;
```

### Connection Settings

```nginx
events {
    worker_connections 2048;  # Tăng cho production
    use epoll;
    multi_accept on;
}
```

### Keepalive

```nginx
upstream backend_api {
    server backend:3000;
    keepalive 32;  # Giữ connections
}
```

### Gzip Compression

```nginx
gzip on;
gzip_comp_level 6;
gzip_min_length 1024;
gzip_types
    application/javascript
    application/json
    text/css
    text/plain;
```

## 🎯 Load Balancing

### Multiple Backend Servers

```nginx
upstream backend_api {
    server backend1:3000 weight=3;
    server backend2:3000 weight=2;
    server backend3:3000 weight=1 backup;
    
    # Health checks
    max_fails=3;
    fail_timeout=30s;
}
```

### Load Balancing Methods

```nginx
# Round robin (default)
upstream backend_api {
    server backend1:3000;
    server backend2:3000;
}

# Least connections
upstream backend_api {
    least_conn;
    server backend1:3000;
    server backend2:3000;
}

# IP hash (sticky sessions)
upstream backend_api {
    ip_hash;
    server backend1:3000;
    server backend2:3000;
}
```

---

✅ **Nginx đã được cấu hình hoàn chỉnh với bảo mật cao cho Hospital Management System!**

Đặc biệt tối ưu cho chức năng forgot password với rate limiting nghiêm ngặt! 🔐
