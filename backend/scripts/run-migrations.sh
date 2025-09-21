#!/bin/bash

# ============================================================================
# RUN ALL MIGRATIONS SCRIPT
# Purpose: Execute all database migrations in correct order
# Usage: ./run-migrations.sh [environment]
# ============================================================================

set -e  # Exit on any error

# Default values
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"hospital_db"}
DB_USER=${DB_USER:-"hospital_user"}
DB_PASS=${DB_PASS:-"hospital_pass"}

# Environment specific overrides
if [ "$1" = "docker" ]; then
    echo "🐳 Using Docker environment settings..."
    DB_HOST="hospital_postgres"
    export PGPASSWORD="$DB_PASS"
elif [ "$1" = "production" ]; then
    echo "🏭 Using Production environment settings..."
    # Load production config
    if [ -f "production.env" ]; then
        source production.env
    fi
fi

# Connection string
DB_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "🏥 Hospital Management System - Database Migrations"
echo "=================================================="
echo "Host: $DB_HOST"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

# Check if database is accessible
echo "🔍 Checking database connection..."
if ! psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to database. Please check:"
    echo "   - Database server is running"
    echo "   - Connection parameters are correct"
    echo "   - User has sufficient privileges"
    exit 1
fi
echo "✅ Database connection successful"

# Create migrations directory in case it doesn't exist
MIGRATIONS_DIR="prisma/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# List of migrations in order
MIGRATIONS=(
    "001_initial_schema.sql"
    "002_rbac_system.sql"
    "003_rbac_seed_data.sql"
    "004_password_reset_tokens.sql"
    "005_link_user_business_tables.sql"
    "006_sync_current_state.sql"
)

echo ""
echo "🚀 Starting migrations..."

# Run each migration
for migration in "${MIGRATIONS[@]}"; do
    migration_file="$MIGRATIONS_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        echo "⚠️  Migration file not found: $migration_file"
        continue
    fi
    
    echo "📄 Running $migration..."
    
    if psql "$DB_URL" -f "$migration_file" > "/tmp/${migration}.log" 2>&1; then
        echo "✅ $migration completed successfully"
    else
        echo "❌ $migration failed! Check log: /tmp/${migration}.log"
        echo "Error output:"
        cat "/tmp/${migration}.log"
        exit 1
    fi
done

echo ""
echo "🎉 All migrations completed successfully!"

# Validate results
echo ""
echo "📊 Validation Results:"
echo "====================="

# Count tables
TABLE_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
echo "📋 Total tables: $TABLE_COUNT"

# Count RBAC data
echo "🔐 RBAC Data:"
psql "$DB_URL" -c "
SELECT 'Roles' as type, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles;
"

# Check admin user
echo ""
echo "👤 Admin User Status:"
psql "$DB_URL" -c "
SELECT email, is_active, 
       (SELECT STRING_AGG(r.role_name, ', ') 
        FROM user_roles ur 
        JOIN roles r ON ur.role_id = r.role_id 
        WHERE ur.user_id = u.user_id) as roles
FROM users u 
WHERE email = 'admin@hospital.com';
"

echo ""
echo "✨ Migration process completed!"
echo ""
echo "Next steps:"
echo "1. Test admin login: admin@hospital.com / admin123456"
echo "2. Verify API endpoints are working"
echo "3. Run application tests if available"