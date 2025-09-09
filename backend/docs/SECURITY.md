# 🔐 Hospital Management System - Security Guide

## 📋 Tổng Quan Bảo Mật

Hệ thống Hospital Management được thiết kế với bảo mật đa lớp:

- 🔐 **Authentication**: JWT với secure tokens
- 👥 **Authorization**: Role-based access control (RBAC)  
- 🛡️ **Input Validation**: XSS và SQL injection protection
- 🚦 **Rate Limiting**: Chống brute force attacks
- 🔒 **Password Security**: Bcrypt hashing + forgot password
- 📧 **Email Security**: Secure reset tokens
- 🌐 **Network Security**: Nginx reverse proxy + SSL

## 🔑 Authentication System

### JWT (JSON Web Tokens)
```javascript
// Token structure
{
  "id": "user-uuid",
  "email": "user@hospital.com", 
  "role": "doctor",
  "patient_id": "patient-uuid", // nếu là patient
  "staff_id": "staff-uuid",     // nếu là staff
  "exp": 1640995200             // expiration timestamp
}
```

### Token Lifecycle
1. **Login**: User gửi email/password
2. **Validation**: Server verify credentials
3. **Generation**: Tạo JWT với user info
4. **Storage**: Client lưu token (localStorage/cookies)
5. **Authorization**: Gửi token trong Authorization header
6. **Verification**: Middleware verify token mỗi request

### Security Features
- **Expiration**: Tokens tự động hết hạn (24h default)
- **Secret Key**: Sử dụng strong secret key (256-bit)
- **Algorithm**: HS256 (HMAC SHA-256)
- **Payload**: Không chứa sensitive data

## 👥 Role-Based Access Control (RBAC)

### User Roles
| Role | Permissions | Mô Tả |
|------|-------------|--------|
| **admin** | Toàn quyền | Quản trị viên hệ thống |
| **doctor** | Patients, Medical Records, Prescriptions | Bác sĩ |
| **nurse** | Patients, Rooms, Basic Medical | Y tá |
| **patient** | Own Data Only | Bệnh nhân |
| **pharmacist** | Medicine, Prescriptions | Dược sĩ |
| **technician** | Equipment, Maintenance | Kỹ thuật viên |
| **driver** | Ambulance Management | Lái xe cứu thương |
| **worker** | Cleaning Services | Nhân viên vệ sinh |

### Permission System
```javascript
// Ví dụ permissions
{
  "resource": "patients",
  "actions": ["create", "read", "update", "delete"],
  "conditions": {
    "own_data_only": true,  // Chỉ data của mình
    "department_only": true // Chỉ trong department
  }
}
```

### Authorization Middleware
```javascript
// Kiểm tra role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

// Usage
router.get('/admin-only', requireRole(['admin']), controller.adminFunction);
```

## 🛡️ Input Validation & Sanitization

### XSS Protection
```javascript
// Sử dụng xss library
const xss = require('xss');

const sanitizeInput = (input) => {
  return xss(input, {
    whiteList: {},  // Không cho phép HTML tags
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style']
  });
};
```

### SQL Injection Prevention
```javascript
// ✅ ĐÚNG: Sử dụng Prisma ORM
const users = await prisma.users.findMany({
  where: {
    email: userInput  // Prisma tự động escape
  }
});

// ❌ SAI: Raw SQL với string concatenation
const query = `SELECT * FROM users WHERE email = '${userInput}'`;
```

### Validation Rules
```javascript
// Express-validator rules
const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .isLength({ max: 100 })
  .withMessage('Valid email required');

const validatePassword = body('password')
  .isLength({ min: 8 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain uppercase, lowercase, and number');
```

## 🚦 Rate Limiting

### API Rate Limits
```nginx
# Nginx configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=forgot_password:10m rate=3r/m;
```

### Endpoint-Specific Limits
| Endpoint | Rate Limit | Burst | Mục đích |
|----------|------------|-------|----------|
| `/api/` | 10 req/s | 20 | API chung |
| `/api/v1/auth/login` | 5 req/m | 5 | Chống brute force |
| `/api/v1/auth/forgot-password` | 3 req/m | 2 | Chống spam email |
| `/api/v1/auth/reset-password` | 5 req/m | 3 | Bảo vệ reset |

### Application-Level Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, authController.login);
```

## 🔒 Password Security

### Password Hashing
```javascript
const bcrypt = require('bcryptjs');

// Hash password (12 rounds for security)
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
```

### Password Requirements
- **Minimum Length**: 8 characters
- **Complexity**: Uppercase + lowercase + number
- **No Common Passwords**: Dictionary check
- **No Personal Info**: Không chứa email, name

### Password Reset Security
```javascript
// Generate secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token before storing
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
```

## 📧 Email Security (Forgot Password)

### Token-Based Reset
1. **Request**: User nhập email
2. **Generate**: Tạo secure random token (256-bit)
3. **Hash**: Hash token trước khi lưu DB
4. **Email**: Gửi plain token qua email
5. **Verify**: So sánh hash của token từ email với DB
6. **Single Use**: Token bị vô hiệu sau khi sử dụng

### Security Features
- **Expiration**: 30 phút (configurable)
- **Single Use**: Token chỉ dùng 1 lần
- **Hashed Storage**: Không lưu plain token trong DB
- **Rate Limited**: 3 requests/phút
- **No User Enumeration**: Luôn trả về success response

### Email Template Security
```html
<!-- Secure email template -->
<p>Click this link to reset password:</p>
<a href="https://yourdomain.com/reset-password?token=SECURE_TOKEN">
  Reset Password
</a>

<!-- Security warnings -->
<p>⚠️ Link expires in 30 minutes</p>
<p>🔒 If you didn't request this, ignore this email</p>
```

## 🌐 Network Security (Nginx)

### SSL/TLS Configuration
```nginx
# Modern SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Security Headers
```nginx
# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Content Type Options
add_header X-Content-Type-Options "nosniff" always;

# Frame Options
add_header X-Frame-Options "SAMEORIGIN" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline';" always;
```

### Upload Security
```nginx
# Prevent execution of uploaded files
location /uploads/ {
  location ~* \.(php|jsp|pl|py|asp|sh|cgi)$ {
    deny all;
  }
  
  add_header X-Content-Type-Options nosniff;
}
```

## 🔍 Security Monitoring

### Logging Strategy
```javascript
// Security events to log
const securityEvents = {
  'LOGIN_SUCCESS': { level: 'info', message: 'User login successful' },
  'LOGIN_FAILED': { level: 'warn', message: 'Failed login attempt' },
  'PASSWORD_RESET_REQUEST': { level: 'info', message: 'Password reset requested' },
  'PASSWORD_RESET_SUCCESS': { level: 'info', message: 'Password reset successful' },
  'RATE_LIMIT_EXCEEDED': { level: 'warn', message: 'Rate limit exceeded' },
  'INVALID_TOKEN': { level: 'warn', message: 'Invalid JWT token' },
  'PERMISSION_DENIED': { level: 'warn', message: 'Insufficient permissions' }
};
```

### Log Analysis
```bash
# Monitor failed logins
docker-compose logs backend | grep "LOGIN_FAILED"

# Monitor forgot password attempts
docker-compose exec nginx tail -f /var/log/nginx/forgot_password.log

# Monitor rate limiting
docker-compose logs nginx | grep "limiting requests"

# Security dashboard
docker-compose logs --since 1h | grep -E "(WARN|ERROR)"
```

### Alerting
```javascript
// Alert on suspicious activity
const alertThresholds = {
  failedLogins: 10,        // per 5 minutes
  passwordResets: 5,       // per hour
  rateLimitHits: 100,      // per hour
  invalidTokens: 20        // per hour
};

// Send alerts via email/Slack/webhook
const sendSecurityAlert = (event, count, timeframe) => {
  // Implementation
};
```

## 🧪 Security Testing

### Automated Security Tests
```javascript
// Security test examples
describe('Security Tests', () => {
  test('Should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: maliciousInput, password: 'test' });
    
    expect(response.status).toBe(400);
    // Verify database still exists
  });

  test('Should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("xss")</script>';
    const response = await request(app)
      .post('/api/v1/patients')
      .send({ name: xssPayload });
    
    expect(response.body.data.name).not.toContain('<script>');
  });
});
```

### Manual Security Checklist
- [ ] **Authentication**: Test login with invalid credentials
- [ ] **Authorization**: Test accessing resources without permission
- [ ] **Rate Limiting**: Test with automated requests
- [ ] **Input Validation**: Test with malicious payloads
- [ ] **File Upload**: Test uploading executable files
- [ ] **HTTPS**: Verify SSL certificate and redirects
- [ ] **Headers**: Check security headers presence
- [ ] **Logs**: Verify security events are logged

## 🚨 Incident Response

### Security Incident Types
1. **Brute Force Attack**: Multiple failed login attempts
2. **Data Breach**: Unauthorized data access
3. **DDoS Attack**: Service unavailability
4. **Malware Upload**: Malicious file upload
5. **Privilege Escalation**: Unauthorized role access

### Response Procedures
1. **Detection**: Monitor logs and alerts
2. **Assessment**: Determine severity and impact
3. **Containment**: Block malicious IPs/users
4. **Investigation**: Analyze logs and traces
5. **Recovery**: Restore services and data
6. **Documentation**: Record incident details

### Emergency Contacts
```bash
# Block IP address
iptables -A INPUT -s MALICIOUS_IP -j DROP

# Disable user account
docker-compose exec backend node -e "
const { prisma } = require('./src/config/prisma');
prisma.users.update({
  where: { email: 'suspicious@user.com' },
  data: { is_active: false }
});
"

# Emergency maintenance mode
# Update nginx config to return 503
```

## 📋 Security Best Practices

### Development
- ✅ Never commit secrets to git
- ✅ Use environment variables for config
- ✅ Validate all user inputs
- ✅ Use parameterized queries
- ✅ Implement proper error handling
- ✅ Keep dependencies updated

### Production
- ✅ Use HTTPS everywhere
- ✅ Implement security headers
- ✅ Regular security audits
- ✅ Monitor and log security events
- ✅ Backup and disaster recovery plan
- ✅ Regular penetration testing

### Compliance
- ✅ **HIPAA**: Healthcare data protection
- ✅ **GDPR**: Personal data rights
- ✅ **SOC 2**: Security controls
- ✅ **ISO 27001**: Information security management

---

🔐 **Hospital Management System Security Framework**  
Designed for healthcare-grade security and compliance  
© 2025 Hospital Management Team
