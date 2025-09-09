# 🔐 SSL Certificates cho Hospital Management System

## 📋 Tổng Quan

Thư mục này chứa SSL certificates cho HTTPS trong môi trường development.

## 🚀 Tạo SSL Certificates

### Cách 1: Sử dụng Script (Khuyến nghị)

```bash
# Trong Docker container
docker-compose exec nginx bash /etc/nginx/ssl/generate-ssl.sh
```

### Cách 2: Tạo thủ công

```bash
# Tạo private key
openssl genrsa -out server.key 2048

# Tạo certificate signing request
openssl req -new -key server.key -out server.csr \
  -subj "/C=VN/ST=HoChiMinh/L=HoChiMinh/O=Hospital Management/OU=IT Department/CN=localhost"

# Tạo self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Set permissions
chmod 600 server.key
chmod 644 server.crt

# Xóa CSR file
rm server.csr
```

## 📁 File Structure

```
ssl/
├── server.crt          # SSL certificate
├── server.key          # Private key
├── generate-ssl.sh     # Script tạo certificates
└── README.md           # Hướng dẫn này
```

## ⚙️ Cấu hình Nginx

Certificates sẽ được mount vào container tại:
- Certificate: `/etc/nginx/ssl/server.crt`
- Private Key: `/etc/nginx/ssl/server.key`

## 🔒 Bảo Mật

### Development
- ✅ Self-signed certificates cho local development
- ⚠️ Browser sẽ hiển thị cảnh báo bảo mật (bình thường)
- 🔄 Certificates hết hạn sau 365 ngày

### Production
- 🚫 **KHÔNG sử dụng self-signed certificates**
- ✅ Sử dụng certificates từ CA tin cậy (Let's Encrypt, etc.)
- 🔐 Cấu hình HSTS và security headers

## 🛠️ Troubleshooting

### Lỗi "Permission denied"
```bash
chmod 600 server.key
chmod 644 server.crt
```

### Lỗi "Certificate not found"
```bash
# Kiểm tra file tồn tại
ls -la /etc/nginx/ssl/

# Tạo lại certificates
bash /etc/nginx/ssl/generate-ssl.sh
```

### Browser hiển thị "Not Secure"
- ✅ Bình thường với self-signed certificates
- 🔧 Click "Advanced" → "Proceed to localhost"
- 🔒 Hoặc thêm exception trong browser

## 📝 Ghi Chú

- Certificates này chỉ dùng cho development
- Không commit private key vào git
- Cần thay thế bằng certificates thật cho production
