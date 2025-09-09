# ============================================================================
# MIGRATION RUNNER SCRIPT FOR WINDOWS POWERSHELL
# ============================================================================
# 
# Script để chạy database migrations trong Docker environment trên Windows
# Sử dụng: .\scripts\run-migrations.ps1 [options]
# 
# Options:
#   -All         Chạy tất cả migrations
#   -Migration   Chạy migration cụ thể (001, 002, 003)
#   -Check       Kiểm tra trạng thái database
#   -Help        Hiển thị help
# 

param(
    [switch]$All,
    [string]$Migration,
    [switch]$Check,
    [switch]$Help
)

# Configuration
$CONFIG = @{
    POSTGRES_HOST = "postgres"
    POSTGRES_PORT = 5432
    POSTGRES_USER = "postgres"
    POSTGRES_PASSWORD = "postgres"
    POSTGRES_DB = "hospital"
    DOCKER_COMPOSE_SERVICE = "backend"
}

# Migration files mapping
$MIGRATIONS = @{
    "001" = "001_initial_schema.sql"
    "002" = "002_rbac_system.sql"
    "003" = "003_rbac_seed_data.sql"
}

# Colors for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "🔧 $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

# Execute command in Docker container
function Invoke-DockerCommand {
    param(
        [string]$Command,
        [string]$Service = $CONFIG.DOCKER_COMPOSE_SERVICE,
        [switch]$Silent
    )
    
    $dockerCommand = "docker-compose exec $Service $Command"
    Write-Info "Executing: $dockerCommand"
    
    try {
        if ($Silent) {
            $result = Invoke-Expression $dockerCommand 2>$null
        } else {
            $result = Invoke-Expression $dockerCommand
        }
        return $result
    } catch {
        Write-Error "Error executing command: $($_.Exception.Message)"
        return $null
    }
}

# Check if migration file exists
function Test-MigrationFile {
    param([string]$MigrationId)
    
    if (-not $MIGRATIONS.ContainsKey($MigrationId)) {
        Write-Error "Unknown migration ID: $MigrationId"
        return $false
    }
    
    $filename = $MIGRATIONS[$MigrationId]
    $filepath = Join-Path $PSScriptRoot "..\prisma\migrations\$filename"
    
    if (-not (Test-Path $filepath)) {
        Write-Error "Migration file not found: $filepath"
        return $false
    }
    
    return $true
}

# Run a single migration
function Invoke-Migration {
    param([string]$MigrationId)
    
    if (-not (Test-MigrationFile $MigrationId)) {
        return $false
    }
    
    $filename = $MIGRATIONS[$MigrationId]
    $connectionString = "postgresql://$($CONFIG.POSTGRES_USER):$($CONFIG.POSTGRES_PASSWORD)@$($CONFIG.POSTGRES_HOST):$($CONFIG.POSTGRES_PORT)/$($CONFIG.POSTGRES_DB)"
    
    Write-Host "🚀 Running migration $MigrationId : $filename" -ForegroundColor Yellow
    
    $command = "psql `"$connectionString`" -f prisma/migrations/$filename"
    $result = Invoke-DockerCommand -Command $command
    
    if ($result -ne $null) {
        Write-Success "Migration $MigrationId completed successfully"
        return $true
    } else {
        Write-Error "Migration $MigrationId failed"
        return $false
    }
}

# Run all migrations in sequence
function Invoke-AllMigrations {
    Write-Host "🚀 Running all migrations..." -ForegroundColor Yellow
    
    $migrationOrder = @("001", "002", "003")
    $allSuccessful = $true
    
    foreach ($migrationId in $migrationOrder) {
        $success = Invoke-Migration $migrationId
        if (-not $success) {
            $allSuccessful = $false
            break
        }
        Write-Host "" # Add spacing between migrations
    }
    
    if ($allSuccessful) {
        Write-Success "All migrations completed successfully!"
        Test-DatabaseStatus
    } else {
        Write-Error "Migration process failed. Please check the errors above."
        exit 1
    }
}

# Check database status
function Test-DatabaseStatus {
    Write-Host "📊 Checking database status..." -ForegroundColor Yellow
    
    $connectionString = "postgresql://$($CONFIG.POSTGRES_USER):$($CONFIG.POSTGRES_PASSWORD)@$($CONFIG.POSTGRES_HOST):$($CONFIG.POSTGRES_PORT)/$($CONFIG.POSTGRES_DB)"
    
    # Check tables
    $tablesQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
"@
    
    $command = "psql `"$connectionString`" -c `"$tablesQuery`""
    Write-Host "`n📋 Database Tables:" -ForegroundColor Cyan
    Invoke-DockerCommand -Command $command
    
    # Check RBAC data
    $rbacQuery = @"
SELECT 'Roles' as type, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Permissions', COUNT(*) FROM permissions
UNION ALL  
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles;
"@
    
    $rbacCommand = "psql `"$connectionString`" -c `"$rbacQuery`""
    Write-Host "`n🔐 RBAC Data:" -ForegroundColor Cyan
    Invoke-DockerCommand -Command $rbacCommand
}

# Show help
function Show-Help {
    Write-Host @"

🏥 Hospital Management System - Migration Runner (PowerShell)

Usage: .\scripts\run-migrations.ps1 [options]

Options:
  -All              Run all migrations in sequence (001 → 002 → 003)
  -Migration <id>   Run specific migration (001, 002, or 003)
  -Check           Check database status and show tables/data
  -Help            Show this help message

Examples:
  .\scripts\run-migrations.ps1 -All
  .\scripts\run-migrations.ps1 -Migration 001
  .\scripts\run-migrations.ps1 -Check

Available Migrations:
  001: Initial Hospital Schema (departments, rooms, staff, patients, etc.)
  002: RBAC System (users, roles, permissions, RLS policies)
  003: RBAC Seed Data (default roles, permissions, admin user)

Requirements:
  - Docker and docker-compose running
  - PostgreSQL container accessible
  - Backend service configured in docker-compose.yml

"@ -ForegroundColor White
}

# Main function
function Main {
    # Check if we're in the correct directory
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Error "Please run this script from the backend directory (where docker-compose.yml is located)"
        exit 1
    }
    
    if ($Help -or ($args.Count -eq 0 -and -not $All -and -not $Migration -and -not $Check)) {
        Show-Help
        return
    }
    
    if ($All) {
        Invoke-AllMigrations
    } elseif ($Migration) {
        if (-not $Migration) {
            Write-Error "Please specify migration ID (001, 002, or 003)"
            exit 1
        }
        Invoke-Migration $Migration
    } elseif ($Check) {
        Test-DatabaseStatus
    } else {
        Write-Error "Unknown option. Use -Help for usage information."
        exit 1
    }
}

# Run the script
Main
