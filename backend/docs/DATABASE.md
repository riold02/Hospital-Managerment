# 🗄️ Hospital Management System - Database Guide

## 📋 Database Overview

Hospital Management System sử dụng PostgreSQL với Prisma ORM:

- **Database**: PostgreSQL 15+
- **ORM**: Prisma Client
- **Migrations**: SQL-based với versioning
- **Authentication**: RBAC system
- **Security**: RLS policies, parameterized queries

## 🏗️ Database Architecture

### Core Tables Structure
```
Users & Auth:
├── users                    # Central authentication
├── roles                    # System roles
├── permissions              # Fine-grained permissions
├── user_roles               # User-role mapping
├── role_permissions         # Role-permission mapping
└── password_reset_tokens    # Secure password reset

Medical Core:
├── patients                 # Patient information
├── doctors                  # Doctor profiles
├── staff                    # Hospital staff
├── departments              # Hospital departments
├── appointments             # Medical appointments
├── medical_records          # Patient medical history
└── prescriptions           # Medical prescriptions

Hospital Management:
├── rooms                    # Hospital rooms
├── room_types              # Room categories
├── room_assignments        # Room allocation
├── ambulance               # Ambulance fleet
├── ambulance_log           # Ambulance usage
└── cleaning_service        # Maintenance records

Pharmacy & Medicine:
├── medicine                # Medicine inventory
├── pharmacy                # Pharmacy transactions
└── billing                 # Financial records
```

## 📊 Schema Details

### Users & Authentication
```sql
-- Central users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role-based access control
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Password reset tokens (secure)
CREATE TABLE password_reset_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    token_hash VARCHAR(255) NOT NULL,  -- Hashed token
    expires_at TIMESTAMPTZ NOT NULL,   -- 30 minutes expiry
    used_at TIMESTAMPTZ,               -- Single use
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Medical Records
```sql
-- Patient information
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES users(user_id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender CHAR(1),
    contact_number VARCHAR(15),
    address VARCHAR(255),
    email VARCHAR(100),
    medical_history TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical appointments
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
    doctor_id INTEGER REFERENCES doctors(doctor_id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    purpose VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Migration System

### Migration Files
```
prisma/migrations/
├── 001_initial_schema.sql      # Core hospital schema
├── 002_rbac_system.sql         # Authentication & roles  
├── 003_rbac_seed_data.sql      # Default users & permissions
├── 004_password_reset_tokens.sql # Forgot password feature
└── README.md                   # Migration documentation
```

### Running Migrations
```bash
# Run all migrations
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --all

# Run specific migration
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --migration 001

# Check migration status
docker-compose -f docker-compose.dev.yml exec backend node scripts/run-migrations.js --check
```

### Migration Script Usage
```bash
# Available options
node scripts/run-migrations.js --help

# Examples
node scripts/run-migrations.js --all                    # Run all
node scripts/run-migrations.js --migration 002          # Run specific
node scripts/run-migrations.js --check                  # Status check
```

## 🔐 Security Features

### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own data
CREATE POLICY patient_own_data ON patients
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- Doctors can see patients in their department
CREATE POLICY doctor_department_patients ON patients
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM staff s
            WHERE s.user_id = auth.uid()
            AND s.role = 'doctor'
            AND s.department_id = patients.department_id
        )
    );
```

### Data Encryption
```sql
-- Encrypt sensitive fields (if needed)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt medical history
UPDATE patients SET 
    medical_history = pgp_sym_encrypt(medical_history, 'encryption_key')
WHERE medical_history IS NOT NULL;
```

### Audit Logging
```sql
-- Create audit log table
CREATE TABLE audit_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, operation, user_id, old_values, new_values)
    VALUES (
        TG_TABLE_NAME,
        TG_OP,
        current_setting('app.current_user_id', true)::UUID,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## 📈 Performance Optimization

### Indexes
```sql
-- Authentication indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Medical data indexes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);

-- Search indexes
CREATE INDEX idx_patients_name ON patients(first_name, last_name);
CREATE INDEX idx_patients_email ON patients(email);

-- Password reset indexes (already in migration)
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);
```

### Query Optimization
```sql
-- Explain query plans
EXPLAIN ANALYZE SELECT * FROM appointments 
WHERE appointment_date >= CURRENT_DATE 
AND patient_id = 123;

-- Optimize with proper indexes
CREATE INDEX idx_appointments_date_patient ON appointments(appointment_date, patient_id);
```

### Connection Pooling
```javascript
// Prisma connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20'
    }
  }
});
```

## 🔧 Database Operations

### Backup & Restore
```bash
# Full database backup
docker-compose exec postgres pg_dump -U hospital_user hospital_db_dev > backup_$(date +%Y%m%d).sql

# Compressed backup
docker-compose exec postgres pg_dump -U hospital_user hospital_db_dev | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore from backup
docker-compose exec -T postgres psql -U hospital_user hospital_db_dev < backup_$(date +%Y%m%d).sql

# Restore specific tables
pg_restore -U hospital_user -d hospital_db_dev -t patients backup.sql
```

### Data Seeding
```bash
# Seed default data
docker-compose exec backend node scripts/run-migrations.js --migration 003

# Custom seed script
docker-compose exec backend node scripts/seed-data.js
```

### Database Maintenance
```sql
-- Analyze table statistics
ANALYZE patients;

-- Vacuum to reclaim space
VACUUM FULL patients;

-- Reindex for performance
REINDEX TABLE appointments;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📊 Monitoring & Analytics

### Database Monitoring
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long running queries
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Database size
SELECT pg_size_pretty(pg_database_size('hospital_db_dev'));

-- Table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables;
```

### Performance Metrics
```bash
# Database performance monitoring
docker-compose exec postgres psql -U hospital_user -d hospital_db_dev -c "
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;
"
```

## 🧪 Testing

### Database Testing
```javascript
// Test database connection
describe('Database Connection', () => {
  test('Should connect to database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result[0].test).toBe(1);
  });

  test('Should create and retrieve patient', async () => {
    const patient = await prisma.patients.create({
      data: {
        first_name: 'Test',
        last_name: 'Patient',
        date_of_birth: new Date('1990-01-01'),
        email: 'test@example.com'
      }
    });

    expect(patient.first_name).toBe('Test');
  });
});
```

### Migration Testing
```bash
# Test migrations on clean database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec backend node scripts/run-migrations.js --all

# Verify schema
docker-compose exec postgres psql -U hospital_user -d hospital_db_dev -c "\dt"
```

## 🔍 Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U hospital_user -d hospital_db_dev -c "SELECT version();"

# Check connection string
echo $DATABASE_URL
```

#### Migration Failures
```bash
# Check migration status
docker-compose exec backend node scripts/run-migrations.js --check

# View migration logs
docker-compose logs postgres | grep ERROR

# Reset migrations (CAUTION!)
docker-compose down -v
docker volume rm backend_postgres_data_dev
docker-compose up -d
```

#### Performance Issues
```sql
-- Find slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000  -- queries taking > 1 second
ORDER BY mean_time DESC;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan;  -- More sequential scans than index scans
```

#### Disk Space Issues
```bash
# Check disk usage
docker-compose exec postgres df -h

# Find large tables
docker-compose exec postgres psql -U hospital_user -d hospital_db_dev -c "
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"
```

## 📋 Best Practices

### Development
- ✅ Always use migrations for schema changes
- ✅ Test migrations on staging before production
- ✅ Use transactions for related operations
- ✅ Validate data before database operations
- ✅ Use proper indexes for query performance

### Production
- ✅ Regular automated backups
- ✅ Monitor database performance
- ✅ Set up connection pooling
- ✅ Use read replicas for scaling
- ✅ Implement proper monitoring and alerting

### Security
- ✅ Use parameterized queries (Prisma handles this)
- ✅ Implement proper access controls
- ✅ Encrypt sensitive data at rest
- ✅ Regular security audits
- ✅ Monitor for suspicious activities

---

🗄️ **Hospital Management Database System**  
Designed for healthcare data integrity and performance  
© 2025 Hospital Management Team
