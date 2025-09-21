const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🚀 Starting admin user creation...');

    // Check if admin user already exists
    const existingAdmin = await prisma.users.findFirst({
      where: { email: 'admin@hospital.com' }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: admin@hospital.com');
      return;
    }

    // Create admin user with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create admin user
      const hashedPassword = await bcrypt.hash('admin123456', 12);
      
      const adminUser = await tx.users.create({
        data: {
          email: 'admin@hospital.com',
          password_hash: hashedPassword,
          is_active: true,
          is_verified: true
        }
      });

      // Step 2: Ensure admin role exists
      let adminRole = await tx.roles.findFirst({
        where: { role_name: 'admin' }
      });

      if (!adminRole) {
        adminRole = await tx.roles.create({
          data: {
            role_name: 'admin',
            role_description: 'System Administrator with full access',
            is_active: true
          }
        });
        console.log('✅ Created admin role');
      }

      // Step 3: Assign admin role to user
      await tx.user_roles.create({
        data: {
          user_id: adminUser.user_id,
          role_id: adminRole.role_id,
          assigned_at: new Date(),
          is_active: true
        }
      });

      // Step 4: Create admin staff record
      // First check if Administration department exists
      let adminDept = await tx.departments.findFirst({
        where: { department_name: 'Administration' }
      });

      if (!adminDept) {
        adminDept = await tx.departments.create({
          data: {
            department_name: 'Administration',
            location: 'Administrative Building'
          }
        });
        console.log('✅ Created Administration department');
      }

      const adminStaff = await tx.staff.create({
        data: {
          user_id: adminUser.user_id,
          first_name: 'System',
          last_name: 'Administrator',
          role: 'admin',
          position: 'System Administrator',
          department_id: adminDept.department_id,
          email: 'admin@hospital.com',
          phone: '+84901234567',
          hire_date: new Date()
        }
      });

      return { adminUser, adminRole, adminStaff, adminDept };
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@hospital.com');
    console.log('🔑 Password: admin123456');
    console.log('👤 User ID:', result.adminUser.user_id);
    console.log('🏥 Staff ID:', result.adminStaff.staff_id);
    console.log('🔐 Role:', result.adminRole.role_name);
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function createDefaultRoles() {
  try {
    console.log('📋 Creating default roles...');

    const defaultRoles = [
      {
        role_name: 'admin',
        role_description: 'System Administrator with full access',
        is_active: true
      },
      {
        role_name: 'doctor',
        role_description: 'Medical Doctor',
        is_active: true
      },
      {
        role_name: 'nurse',
        role_description: 'Registered Nurse',
        is_active: true
      },
      {
        role_name: 'pharmacist',
        role_description: 'Hospital Pharmacist',
        is_active: true
      },
      {
        role_name: 'technician',
        role_description: 'Medical Technician',
        is_active: true
      },
      {
        role_name: 'driver',
        role_description: 'Ambulance Driver',
        is_active: true
      },
      {
        role_name: 'worker',
        role_description: 'Hospital Worker/Support Staff',
        is_active: true
      },
      {
        role_name: 'patient',
        role_description: 'Hospital Patient',
        is_active: true
      }
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await prisma.roles.findFirst({
        where: { role_name: roleData.role_name }
      });

      if (!existingRole) {
        await prisma.roles.create({ data: roleData });
        console.log(`✅ Created role: ${roleData.role_name}`);
      } else {
        console.log(`⚠️  Role already exists: ${roleData.role_name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating default roles:', error);
    throw error;
  }
}

async function createDefaultDepartments() {
  try {
    console.log('🏥 Creating default departments...');

    const defaultDepartments = [
      {
        department_name: 'Administration',
        location: 'Administrative Building'
      },
      {
        department_name: 'Emergency',
        location: 'Emergency Wing - Ground Floor'
      },
      {
        department_name: 'Cardiology',
        location: 'Medical Building - 2nd Floor'
      },
      {
        department_name: 'Pediatrics',
        location: 'Medical Building - 3rd Floor'
      },
      {
        department_name: 'Orthopedics',
        location: 'Medical Building - 4th Floor'
      },
      {
        department_name: 'Pharmacy',
        location: 'Ground Floor - Near Reception'
      },
      {
        department_name: 'Laboratory',
        location: 'Basement Level'
      },
      {
        department_name: 'Radiology',
        location: 'Basement Level'
      },
      {
        department_name: 'Surgery',
        location: 'Medical Building - 5th Floor'
      },
      {
        department_name: 'Nursing',
        location: 'All Floors'
      }
    ];

    for (const deptData of defaultDepartments) {
      const existingDept = await prisma.departments.findFirst({
        where: { department_name: deptData.department_name }
      });

      if (!existingDept) {
        await prisma.departments.create({ data: deptData });
        console.log(`✅ Created department: ${deptData.department_name}`);
      } else {
        console.log(`⚠️  Department already exists: ${deptData.department_name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error creating default departments:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🏥 Hospital Management System - Admin Setup');
    console.log('==========================================');
    
    await createDefaultRoles();
    console.log('');
    
    await createDefaultDepartments();
    console.log('');
    
    await createAdminUser();
    console.log('');
    
    console.log('🎉 Setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Login with admin@hospital.com / admin123456');
    console.log('2. Change the default password');
    console.log('3. Start creating staff accounts');
    console.log('');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createAdminUser, createDefaultRoles, createDefaultDepartments };