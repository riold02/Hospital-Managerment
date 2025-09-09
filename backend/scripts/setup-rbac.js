const { Client } = require('pg');

// Database connection
const client = new Client({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'hospital',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

async function setupRBAC() {
  try {
    await client.connect();
    console.log('🔗 Connected to PostgreSQL database');

    // 1. Create Roles
    console.log('📋 Creating roles...');
    const roles = [
      { name: 'admin', description: 'System Administrator - Full access' },
      { name: 'doctor', description: 'Doctor - Medical staff with patient access' },
      { name: 'nurse', description: 'Nurse - Healthcare support staff' },
      { name: 'pharmacist', description: 'Pharmacist - Medicine management' },
      { name: 'technician', description: 'Medical Technician - Equipment and lab' },
      { name: 'driver', description: 'Ambulance Driver - Emergency transport' },
      { name: 'worker', description: 'Hospital Worker - Cleaning and maintenance' },
      { name: 'patient', description: 'Patient - Limited personal access' }
    ];

    for (const role of roles) {
      await client.query(`
        INSERT INTO roles (role_name, description) 
        VALUES ($1, $2) 
        ON CONFLICT (role_name) DO NOTHING
      `, [role.name, role.description]);
      console.log(`✅ Role created: ${role.name}`);
    }

    // 2. Create Permissions
    console.log('🔐 Creating permissions...');
    const resources = ['patients', 'appointments', 'medical_records', 'prescriptions', 'pharmacy', 'billing', 'staff', 'rooms', 'ambulances', 'reports'];
    const actions = ['create', 'read', 'update', 'delete'];
    
    for (const resource of resources) {
      for (const action of actions) {
        const permissionName = `${resource}:${action}`;
        await client.query(`
          INSERT INTO permissions (permission_name, resource, action, description) 
          VALUES ($1, $2, $3, $4) 
          ON CONFLICT (resource, action) DO NOTHING
        `, [permissionName, resource, action, `${action} access to ${resource}`]);
      }
    }
    console.log(`✅ Created permissions for ${resources.length} resources`);

    // 3. Assign Permissions to Roles
    console.log('🎯 Assigning permissions to roles...');
    
    // Admin - Full access
    const adminRoleId = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['admin']);
    const allPermissions = await client.query('SELECT permission_id FROM permissions');
    
    for (const perm of allPermissions.rows) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES ($1, $2) 
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [adminRoleId.rows[0].role_id, perm.permission_id]);
    }
    console.log('✅ Admin role: Full permissions assigned');

    // Doctor permissions
    const doctorRoleId = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['doctor']);
    const doctorResources = ['patients', 'appointments', 'medical_records', 'prescriptions'];
    
    for (const resource of doctorResources) {
      const permissions = await client.query(
        'SELECT permission_id FROM permissions WHERE resource = $1', 
        [resource]
      );
      for (const perm of permissions.rows) {
        await client.query(`
          INSERT INTO role_permissions (role_id, permission_id) 
          VALUES ($1, $2) 
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [doctorRoleId.rows[0].role_id, perm.permission_id]);
      }
    }
    console.log('✅ Doctor role: Medical permissions assigned');

    // Nurse permissions
    const nurseRoleId = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['nurse']);
    const nurseResources = ['patients', 'appointments', 'medical_records'];
    const nurseActions = ['read', 'update'];
    
    for (const resource of nurseResources) {
      for (const action of nurseActions) {
        const permission = await client.query(
          'SELECT permission_id FROM permissions WHERE resource = $1 AND action = $2', 
          [resource, action]
        );
        if (permission.rows.length > 0) {
          await client.query(`
            INSERT INTO role_permissions (role_id, permission_id) 
            VALUES ($1, $2) 
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `, [nurseRoleId.rows[0].role_id, permission.rows[0].permission_id]);
        }
      }
    }
    console.log('✅ Nurse role: Healthcare support permissions assigned');

    // Pharmacist permissions
    const pharmacistRoleId = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['pharmacist']);
    const pharmacistResources = ['pharmacy', 'prescriptions'];
    
    for (const resource of pharmacistResources) {
      const permissions = await client.query(
        'SELECT permission_id FROM permissions WHERE resource = $1', 
        [resource]
      );
      for (const perm of permissions.rows) {
        await client.query(`
          INSERT INTO role_permissions (role_id, permission_id) 
          VALUES ($1, $2) 
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [pharmacistRoleId.rows[0].role_id, perm.permission_id]);
      }
    }
    // Add read access to patients for pharmacist
    const patientReadPerm = await client.query(
      'SELECT permission_id FROM permissions WHERE resource = $1 AND action = $2', 
      ['patients', 'read']
    );
    if (patientReadPerm.rows.length > 0) {
      await client.query(`
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES ($1, $2) 
        ON CONFLICT (role_id, permission_id) DO NOTHING
      `, [pharmacistRoleId.rows[0].role_id, patientReadPerm.rows[0].permission_id]);
    }
    console.log('✅ Pharmacist role: Pharmacy permissions assigned');

    // Patient permissions (read own data only)
    const patientRoleId = await client.query('SELECT role_id FROM roles WHERE role_name = $1', ['patient']);
    const patientPermissions = [
      { resource: 'patients', action: 'read' },
      { resource: 'appointments', action: 'read' },
      { resource: 'medical_records', action: 'read' },
      { resource: 'prescriptions', action: 'read' },
      { resource: 'billing', action: 'read' }
    ];
    
    for (const perm of patientPermissions) {
      const permission = await client.query(
        'SELECT permission_id FROM permissions WHERE resource = $1 AND action = $2', 
        [perm.resource, perm.action]
      );
      if (permission.rows.length > 0) {
        await client.query(`
          INSERT INTO role_permissions (role_id, permission_id) 
          VALUES ($1, $2) 
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `, [patientRoleId.rows[0].role_id, permission.rows[0].permission_id]);
      }
    }
    console.log('✅ Patient role: Read-only permissions assigned');

    // 4. Create default admin user
    console.log('👤 Creating default admin user...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await client.query(`
      INSERT INTO users (email, password_hash, is_active) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = $2, 
        updated_at = now()
      RETURNING user_id
    `, ['admin@hospital.com', hashedPassword, true]);
    
    // Assign admin role to admin user
    await client.query(`
      INSERT INTO user_roles (user_id, role_id) 
      VALUES ($1, $2) 
      ON CONFLICT (user_id, role_id) DO NOTHING
    `, [adminUser.rows[0].user_id, adminRoleId.rows[0].role_id]);
    
    console.log('✅ Default admin user created: admin@hospital.com / admin123');

    // 5. Summary
    const roleCount = await client.query('SELECT COUNT(*) FROM roles');
    const permissionCount = await client.query('SELECT COUNT(*) FROM permissions');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    
    console.log('\n🎉 RBAC Setup Complete!');
    console.log(`📊 Summary:`);
    console.log(`   • Roles: ${roleCount.rows[0].count}`);
    console.log(`   • Permissions: ${permissionCount.rows[0].count}`);
    console.log(`   • Users: ${userCount.rows[0].count}`);
    console.log(`   • Default Admin: admin@hospital.com / admin123`);
    console.log('\n✅ Hospital Management System RBAC is ready!');

  } catch (error) {
    console.error('❌ RBAC Setup Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run setup
setupRBAC();
