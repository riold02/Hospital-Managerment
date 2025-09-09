# 🔐 Hướng Dẫn Setup Chức Năng Quên Mật Khẩu

## 📋 Tổng Quan

Chức năng quên mật khẩu đã được triển khai hoàn chỉnh với các tính năng bảo mật cao:

- ✅ Gửi email reset password với nodemailer
- ✅ Token bảo mật với thời gian hết hạn
- ✅ Email templates đẹp và responsive
- ✅ Frontend UI/UX hoàn chỉnh
- ✅ Validation và error handling

## 🚀 Các Bước Setup

### 1. Cấu Hình Email Service

Thêm các biến môi trường sau vào file `.env`:

```env
# Frontend URL (để tạo link reset password)
FRONTEND_URL=http://localhost:3000

# Email Configuration - Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here

# Password Reset Configuration  
RESET_TOKEN_EXPIRE_MINUTES=30
```

### 2. Setup Gmail (Khuyến nghị)

1. **Bật 2-Factor Authentication** cho Gmail account
2. **Tạo App Password**:
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Chọn "Mail" và tạo password
   - Sử dụng App Password làm `EMAIL_PASSWORD`

### 3. Alternative: Sử dụng SMTP khác

Nếu không dùng Gmail, cập nhật `src/services/emailService.js`:

```javascript
this.transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
```

Và thêm vào `.env`:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### 4. Testing Environment

Để test trong development, có thể sử dụng:

- **Mailtrap.io**: Fake SMTP service cho testing
- **Ethereal Email**: https://ethereal.email/ - tạo fake account

## 📡 API Endpoints

### POST `/api/v1/auth/forgot-password`
Gửi yêu cầu reset password

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút tới."
}
```

### POST `/api/v1/auth/reset-password`
Đặt lại mật khẩu với token

**Request:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "NewPassword123"
}
```

### GET `/api/v1/auth/verify-reset-token/:token`
Xác thực token reset (optional)

## 🎨 Frontend Pages

- `/auth/forgot-password` - Form yêu cầu reset password
- `/auth/reset-password?token=xyz` - Form đặt lại mật khẩu
- Link "Quên mật khẩu?" đã được thêm vào `/auth`

## 🔒 Tính Năng Bảo Mật

### Token Security
- Token được hash bằng SHA-256 trước khi lưu database
- Token chỉ có hiệu lực trong 30 phút (có thể cấu hình)
- Token chỉ sử dụng được 1 lần
- Tự động xóa token cũ khi tạo token mới

### Email Security
- Không tiết lộ thông tin user không tồn tại
- Email template responsive và professional
- Rate limiting (cần cấu hình thêm)

### Database Security
- Foreign key constraints
- Indexes cho performance
- Cleanup function cho expired tokens

## 🧪 Testing

### 1. Test Email Service
```javascript
// Trong Docker container
docker-compose -f docker-compose.dev.yml exec backend node -e "
const emailService = require('./src/services/emailService');
emailService.verifyConnection().then(console.log);
"
```

### 2. Test Complete Flow
1. Vào `/auth/forgot-password`
2. Nhập email hợp lệ
3. Kiểm tra email nhận được
4. Click link trong email
5. Đặt lại mật khẩu
6. Đăng nhập với mật khẩu mới

## 📊 Database Schema

```sql
-- Bảng password_reset_tokens đã được tạo
CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes cho performance
CREATE INDEX idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
```

## 🛠️ Maintenance

### Cleanup Expired Tokens
Chạy định kỳ để xóa token hết hạn:

```sql
-- Tự động cleanup (đã có function)
SELECT cleanup_expired_reset_tokens();
```

### Monitoring
- Log tất cả password reset attempts
- Monitor failed attempts
- Track email delivery status

## 🚨 Lưu Ý Quan Trọng

1. **Không commit file .env** vào git
2. **Sử dụng App Password** cho Gmail, không dùng password chính
3. **Setup rate limiting** cho production
4. **Monitor logs** cho security incidents
5. **Test email delivery** trước khi deploy production

## 📞 Troubleshooting

### Email không được gửi
- Kiểm tra EMAIL_USER và EMAIL_PASSWORD
- Verify Gmail App Password
- Check firewall/network restrictions
- Test với Mailtrap.io

### Token không hợp lệ
- Kiểm tra FRONTEND_URL trong .env
- Verify database connection
- Check token expiration time

### Frontend không kết nối được API
- Kiểm tra backend đang chạy
- Verify CORS configuration
- Check network connectivity

---

✅ **Chức năng đã hoàn thành và sẵn sàng sử dụng!**

Chỉ cần cấu hình email credentials và test thôi! 🎉
