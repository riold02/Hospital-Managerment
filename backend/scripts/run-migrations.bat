@echo off
REM ============================================================================
REM RUN ALL MIGRATIONS SCRIPT (Windows Batch)
REM Purpose: Execute all database migrations in correct order using Docker
REM Usage: run-migrations.bat
REM ============================================================================

echo.
echo 🏥 Hospital Management System - Database Migrations
echo ==================================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running or not accessible
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)

REM Check if hospital_postgres container is running
docker ps --filter "name=hospital_postgres" --format "{{.Names}}" | findstr hospital_postgres >nul
if errorlevel 1 (
    echo ❌ hospital_postgres container is not running
    echo Please start the container with: docker-compose up -d
    pause
    exit /b 1
)

echo ✅ Docker and PostgreSQL container are running
echo.

REM Database connection details
set DB_CONTAINER=hospital_postgres
set DB_USER=hospital_user
set DB_NAME=hospital_db

echo 🔍 Checking database connection...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo ❌ Cannot connect to database
    echo Please check container logs: docker logs %DB_CONTAINER%
    pause
    exit /b 1
)

echo ✅ Database connection successful
echo.

REM Copy migrations to container
echo 📂 Copying migration files to container...
docker cp prisma/migrations %DB_CONTAINER%:/tmp/
if errorlevel 1 (
    echo ❌ Failed to copy migration files
    pause
    exit /b 1
)

echo 🚀 Starting migrations...
echo.

REM Run migrations in order
echo 📄 Running 001_initial_schema.sql...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -f /tmp/migrations/001_initial_schema.sql
if errorlevel 1 (
    echo ❌ Migration 001 failed
    pause
    exit /b 1
)
echo ✅ Migration 001 completed

echo 📄 Running 002_rbac_system.sql...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -f /tmp/migrations/002_rbac_system.sql
if errorlevel 1 (
    echo ❌ Migration 002 failed
    pause
    exit /b 1
)
echo ✅ Migration 002 completed

echo 📄 Running 003_rbac_seed_data.sql...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -f /tmp/migrations/003_rbac_seed_data.sql
if errorlevel 1 (
    echo ❌ Migration 003 failed
    pause
    exit /b 1
)
echo ✅ Migration 003 completed

echo 📄 Running 004_password_reset_tokens.sql...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -f /tmp/migrations/004_password_reset_tokens.sql
if errorlevel 1 (
    echo ❌ Migration 004 failed
    pause
    exit /b 1
)
echo ✅ Migration 004 completed

echo 📄 Running 005_link_user_business_tables.sql...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -f /tmp/migrations/005_link_user_business_tables.sql
if errorlevel 1 (
    echo ❌ Migration 005 failed
    pause
    exit /b 1
)
echo ✅ Migration 005 completed

echo 📄 Running 006_sync_current_state.sql...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -f /tmp/migrations/006_sync_current_state.sql
if errorlevel 1 (
    echo ❌ Migration 006 failed
    pause
    exit /b 1
)
echo ✅ Migration 006 completed

echo.
echo 🎉 All migrations completed successfully!
echo.

REM Validation
echo 📊 Validation Results:
echo ======================

echo 📋 Checking tables...
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';"

echo.
echo 🔐 RBAC Data:
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -c "SELECT 'Roles' as type, COUNT(*) as count FROM roles UNION ALL SELECT 'Permissions', COUNT(*) FROM permissions UNION ALL SELECT 'Users', COUNT(*) FROM users UNION ALL SELECT 'User Roles', COUNT(*) FROM user_roles;"

echo.
echo 👤 Admin User Status:
docker exec %DB_CONTAINER% psql -U %DB_USER% -d %DB_NAME% -c "SELECT email, is_active FROM users WHERE email = 'admin@hospital.com';"

echo.
echo ✨ Migration process completed!
echo.
echo Next steps:
echo 1. Test admin login: admin@hospital.com / admin123456
echo 2. Verify API endpoints are working
echo 3. Start the backend service if not running
echo.
pause