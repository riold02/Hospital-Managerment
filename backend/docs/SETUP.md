# 🔧 Hospital Management System - Setup Guide

## 📋 Yêu Cầu Hệ Thống

### Development
- Docker & Docker Compose
- Git
- Code editor (VS Code khuyến nghị)

### Production (Optional)
- Node.js 16+
- PostgreSQL 15+
- Nginx
- SSL certificates

## 🚀 Setup Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd hospital-management-system/backend
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Chỉnh sửa .env
nano .env
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL="postgresql://hospital_user:hospital_password@postgres:5432/hospital_db_dev?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"

# Email (for forgot password)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password-here"
FRONTEND_URL="http://localhost:3000"
RESET_TOKEN_EXPIRE_MINUTES=30

# Server
PORT=3000
NODE_ENV="development"
```

### 3. Docker Setup
```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# Check status
docker-compose -f docker-compose.dev.yml ps

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### 4. Database Setup
```bash
# Run all migrations
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --all

# Verify database
docker-compose -f docker-compose.dev.yml exec postgres psql -U hospital_user -d hospital_db_dev -c "\dt"

# Optional: Open pgAdmin
# http://localhost:5050
# Email: admin@hospital.com
# Password: admin123
```

### 5. Verify Installation
```bash
# Health check
curl http://localhost:3000/api/v1/health

# API documentation
open http://localhost:3000/api/docs

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

## 🌐 Nginx Setup (Optional)

### 1. Generate SSL Certificates
```bash
# Create SSL certificates for development
docker-compose -f docker-compose.dev.yml exec nginx bash /etc/nginx/ssl/generate-ssl.sh

# Restart nginx
docker-compose -f docker-compose.dev.yml restart nginx
```

### 2. Access Points
- **HTTP**: http://localhost
- **HTTPS**: https://localhost (accept self-signed certificate)
- **Admin Panel**: http://localhost:8080
- **Nginx Status**: http://localhost:8080/nginx_status

## 📧 Email Configuration

### Gmail Setup (Khuyến nghị)
1. **Enable 2-Factor Authentication** cho Gmail
2. **Create App Password**:
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Chọn "Mail" và generate password
   - Sử dụng App Password làm `EMAIL_PASSWORD`

### Alternative SMTP
```env
# Thay vì Gmail, sử dụng SMTP khác
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
```

### Testing Email
```bash
# Test email service
docker-compose -f docker-compose.dev.yml exec backend node -e "
const emailService = require('./src/services/emailService');
emailService.verifyConnection().then(console.log);
"

# Test forgot password
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🗄️ Database Management

### Migrations
```bash
# Run specific migration
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --migration 001

# Check database status
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --check

# Reset database (CAUTION!)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Backup & Restore
```bash
# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U hospital_user hospital_db_dev > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U hospital_user hospital_db_dev < backup.sql
```

### Prisma Studio
```bash
# Open Prisma Studio (GUI for database)
docker-compose -f docker-compose.dev.yml exec backend npx prisma studio

# Access: http://localhost:5555
```

## 🧪 Development Workflow

### Local Development
```bash
# Start development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
npm run lint:fix

# Generate Prisma client
npm run prisma:generate
```

### Hot Reload
- Backend: Nodemon auto-restart on file changes
- Database: Persistent volumes for data
- Nginx: Config reload without restart

### Debugging
```bash
# View container logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f postgres
docker-compose -f docker-compose.dev.yml logs -f nginx

# Enter container shell
docker-compose -f docker-compose.dev.yml exec backend sh
docker-compose -f docker-compose.dev.yml exec postgres psql -U hospital_user hospital_db_dev
```

## 🚀 Production Deployment

### 1. Environment Setup
```bash
# Copy production environment
cp .env.example .env.production

# Update for production
nano .env.production
```

**Production Environment:**
```env
NODE_ENV="production"
DATABASE_URL="postgresql://user:password@your-db-host:5432/hospital_db"
JWT_SECRET="your-very-secure-secret-key"
EMAIL_USER="noreply@yourdomain.com"
EMAIL_PASSWORD="your-production-email-password"
FRONTEND_URL="https://yourdomain.com"
```

### 2. SSL Certificates
```bash
# Use Let's Encrypt for production
certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Copy certificates
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/server.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/server.key
```

### 3. Deploy
```bash
# Use production config
cp nginx/nginx-production.conf nginx/nginx.conf

# Start production
docker-compose up -d

# Run migrations
docker-compose exec backend node scripts/run-migrations.js --all
```

### 4. Monitoring
```bash
# Check health
curl https://yourdomain.com/api/v1/health

# Monitor logs
docker-compose logs -f --tail=100

# Database monitoring
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 🔧 Troubleshooting

### Common Issues

#### "502 Bad Gateway"
```bash
# Check backend container
docker-compose ps backend

# Check logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

#### Database Connection Error
```bash
# Check postgres container
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U hospital_user -d hospital_db_dev -c "SELECT 1;"

# Reset database
docker-compose down postgres
docker volume rm backend_postgres_data_dev
docker-compose up -d postgres
```

#### Email Not Sending
```bash
# Verify email configuration
docker-compose exec backend node -e "console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWORD)"

# Test email service
docker-compose exec backend node -e "
const emailService = require('./src/services/emailService');
emailService.verifyConnection().then(console.log).catch(console.error);
"
```

#### Port Already in Use
```bash
# Find process using port
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 docker-compose up -d
```

### Performance Issues

#### High Memory Usage
```bash
# Check container stats
docker stats

# Limit memory in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
```

#### Slow Database Queries
```bash
# Enable query logging
docker-compose exec postgres psql -U hospital_user -d hospital_db_dev -c "
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();
"

# View slow queries
docker-compose logs postgres | grep "duration:"
```

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# API health
curl http://localhost:3000/api/v1/health

# Database health
docker-compose exec postgres pg_isready -U hospital_user

# Nginx status
curl http://localhost:8080/nginx_status
```

### Log Rotation
```bash
# Setup logrotate for Docker logs
sudo nano /etc/logrotate.d/docker

# Content:
/var/lib/docker/containers/*/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 root root
    postrotate
        docker kill --signal=USR1 $(docker ps -q) 2>/dev/null || true
    endscript
}
```

### Backup Strategy
```bash
# Daily database backup
0 2 * * * docker-compose -f /path/to/docker-compose.yml exec postgres pg_dump -U hospital_user hospital_db_dev | gzip > /backups/hospital_$(date +\%Y\%m\%d).sql.gz

# Weekly full backup
0 3 * * 0 tar -czf /backups/hospital_full_$(date +\%Y\%m\%d).tar.gz /path/to/project
```

---

✅ **Setup hoàn tất! Hệ thống Hospital Management System đã sẵn sàng!** 🎉
