const { Client } = require('pg');

// Database configuration for testing
const dbConfig = {
    user: 'hospital_user',
    host: 'localhost',
    database: 'hospital_test_migrations',
    password: 'hospital_password',
    port: 5432,
};

async function testDatabase() {
    console.log('🔗 Connecting to test database...');
    
    const client = new Client(dbConfig);
    await client.connect();
    
    try {
        // Test basic queries
        console.log('\n📊 Database Overview:');
        
        // Count tables
        const tablesResult = await client.query(`
            SELECT COUNT(*) as table_count 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log(`   Tables: ${tablesResult.rows[0].table_count}`);
        
        // Test core data
        const usersResult = await client.query('SELECT COUNT(*) FROM users');
        console.log(`   Users: ${usersResult.rows[0].count}`);
        
        const rolesResult = await client.query('SELECT COUNT(*) FROM roles');
        console.log(`   Roles: ${rolesResult.rows[0].count}`);
        
        const permissionsResult = await client.query('SELECT COUNT(*) FROM permissions');
        console.log(`   Permissions: ${permissionsResult.rows[0].count}`);
        
        const staffResult = await client.query('SELECT COUNT(*) FROM staff');
        console.log(`   Staff: ${staffResult.rows[0].count}`);
        
        const deptsResult = await client.query('SELECT COUNT(*) FROM departments');
        console.log(`   Departments: ${deptsResult.rows[0].count}`);
        
        // Test user-staff relationship
        console.log('\n🔗 Testing Relationships:');
        const relationshipTest = await client.query(`
            SELECT 
                s.staff_id,
                s.first_name,
                s.last_name,
                s.role,
                u.email,
                u.is_active
            FROM staff s 
            LEFT JOIN users u ON s.user_id = u.user_id
        `);
        
        console.log('   Staff-User relationships:');
        relationshipTest.rows.forEach(row => {
            console.log(`     - ${row.first_name} ${row.last_name} (${row.role}) -> ${row.email}`);
        });
        
        // Test available tables
        console.log('\n📋 Available Tables:');
        const allTables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        allTables.rows.forEach((table, index) => {
            if (index % 4 === 0) console.log('');
            process.stdout.write(`   ${table.table_name.padEnd(20)}`);
        });
        console.log('\n');
        
        // Test user_id relationships
        console.log('\n🔑 Testing user_id Relationships:');
        
        // Check which tables have user_id columns
        const userIdTables = await client.query(`
            SELECT 
                table_name,
                column_name
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND column_name LIKE '%user_id%'
            ORDER BY table_name, column_name
        `);
        
        userIdTables.rows.forEach(row => {
            console.log(`   ${row.table_name}.${row.column_name}`);
        });
        
        console.log('\n✅ Database is ready for testing!');
        console.log('\n📝 Connection info:');
        console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`   Database: ${dbConfig.database}`);
        console.log(`   User: ${dbConfig.user}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

// Run test
testDatabase().catch(console.error);
