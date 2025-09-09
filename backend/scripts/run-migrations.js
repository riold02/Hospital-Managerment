#!/usr/bin/env node

/**
 * ============================================================================
 * MIGRATION RUNNER SCRIPT
 * ============================================================================
 * 
 * Script để chạy database migrations trong Docker environment
 * Sử dụng: node scripts/run-migrations.js [options]
 * 
 * Options:
 *   --all        Chạy tất cả migrations
 *   --migration  Chạy migration cụ thể (001, 002, 003)
 *   --rollback   Rollback migration (chưa implement)
 *   --check      Kiểm tra trạng thái database
 * 
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  POSTGRES_HOST: 'postgres',
  POSTGRES_PORT: 5432,
  POSTGRES_USER: 'postgres',
  POSTGRES_PASSWORD: 'postgres',
  POSTGRES_DB: 'hospital',
  DOCKER_COMPOSE_SERVICE: 'backend'
};

// Migration files mapping
const MIGRATIONS = {
  '001': '001_initial_schema.sql',
  '002': '002_rbac_system.sql', 
  '003': '003_rbac_seed_data.sql'
};

/**
 * Execute command in Docker container
 */
function executeInDocker(command, options = {}) {
  const dockerCommand = `docker-compose exec ${options.service || CONFIG.DOCKER_COMPOSE_SERVICE} ${command}`;
  
  console.log(`🔧 Executing: ${dockerCommand}`);
  
  try {
    const result = execSync(dockerCommand, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
    return result;
  } catch (error) {
    console.error(`❌ Error executing command: ${error.message}`);
    if (options.exitOnError !== false) {
      process.exit(1);
    }
    return null;
  }
}

/**
 * Check if migration file exists
 */
function checkMigrationFile(migrationId) {
  const filename = MIGRATIONS[migrationId];
  if (!filename) {
    console.error(`❌ Unknown migration ID: ${migrationId}`);
    return false;
  }
  
  const filepath = path.join(__dirname, '..', 'prisma', 'migrations', filename);
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Migration file not found: ${filepath}`);
    return false;
  }
  
  return true;
}

/**
 * Run a single migration
 */
function runMigration(migrationId) {
  if (!checkMigrationFile(migrationId)) {
    return false;
  }
  
  const filename = MIGRATIONS[migrationId];
  const connectionString = `postgresql://${CONFIG.POSTGRES_USER}:${CONFIG.POSTGRES_PASSWORD}@${CONFIG.POSTGRES_HOST}:${CONFIG.POSTGRES_PORT}/${CONFIG.POSTGRES_DB}`;
  
  console.log(`🚀 Running migration ${migrationId}: ${filename}`);
  
  const command = `psql "${connectionString}" -f prisma/migrations/${filename}`;
  const result = executeInDocker(command, { exitOnError: false });
  
  if (result !== null) {
    console.log(`✅ Migration ${migrationId} completed successfully`);
    return true;
  } else {
    console.error(`❌ Migration ${migrationId} failed`);
    return false;
  }
}

/**
 * Run all migrations in sequence
 */
function runAllMigrations() {
  console.log('🚀 Running all migrations...');
  
  const migrationOrder = ['001', '002', '003'];
  let allSuccessful = true;
  
  for (const migrationId of migrationOrder) {
    const success = runMigration(migrationId);
    if (!success) {
      allSuccessful = false;
      break;
    }
    console.log(''); // Add spacing between migrations
  }
  
  if (allSuccessful) {
    console.log('🎉 All migrations completed successfully!');
    checkDatabaseStatus();
  } else {
    console.error('❌ Migration process failed. Please check the errors above.');
    process.exit(1);
  }
}

/**
 * Check database status
 */
function checkDatabaseStatus() {
  console.log('📊 Checking database status...');
  
  const connectionString = `postgresql://${CONFIG.POSTGRES_USER}:${CONFIG.POSTGRES_PASSWORD}@${CONFIG.POSTGRES_HOST}:${CONFIG.POSTGRES_PORT}/${CONFIG.POSTGRES_DB}`;
  
  // Check tables
  const tablesQuery = `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `;
  
  const command = `psql "${connectionString}" -c "${tablesQuery}"`;
  console.log('\n📋 Database Tables:');
  executeInDocker(command);
  
  // Check RBAC data
  const rbacQuery = `
    SELECT 'Roles' as type, COUNT(*) as count FROM roles
    UNION ALL
    SELECT 'Permissions', COUNT(*) FROM permissions
    UNION ALL  
    SELECT 'Users', COUNT(*) FROM users
    UNION ALL
    SELECT 'User Roles', COUNT(*) FROM user_roles;
  `;
  
  const rbacCommand = `psql "${connectionString}" -c "${rbacQuery}"`;
  console.log('\n🔐 RBAC Data:');
  executeInDocker(rbacCommand);
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
🏥 Hospital Management System - Migration Runner

Usage: node scripts/run-migrations.js [options]

Options:
  --all              Run all migrations in sequence (001 → 002 → 003)
  --migration <id>   Run specific migration (001, 002, or 003)
  --check           Check database status and show tables/data
  --help            Show this help message

Examples:
  node scripts/run-migrations.js --all
  node scripts/run-migrations.js --migration 001
  node scripts/run-migrations.js --check

Available Migrations:
  001: Initial Hospital Schema (departments, rooms, staff, patients, etc.)
  002: RBAC System (users, roles, permissions, RLS policies)
  003: RBAC Seed Data (default roles, permissions, admin user)

Requirements:
  - Docker and docker-compose running
  - PostgreSQL container accessible
  - Backend service configured in docker-compose.yml
`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  // Check if we're in the correct directory
  if (!fs.existsSync('docker-compose.yml')) {
    console.error('❌ Please run this script from the backend directory (where docker-compose.yml is located)');
    process.exit(1);
  }
  
  if (args.includes('--all')) {
    runAllMigrations();
  } else if (args.includes('--migration')) {
    const migrationIndex = args.indexOf('--migration');
    const migrationId = args[migrationIndex + 1];
    
    if (!migrationId) {
      console.error('❌ Please specify migration ID (001, 002, or 003)');
      process.exit(1);
    }
    
    runMigration(migrationId);
  } else if (args.includes('--check')) {
    checkDatabaseStatus();
  } else {
    console.error('❌ Unknown option. Use --help for usage information.');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  runMigration,
  runAllMigrations,
  checkDatabaseStatus
};
