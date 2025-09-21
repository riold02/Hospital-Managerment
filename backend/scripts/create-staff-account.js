const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createStaffAccount() {
  try {
    console.log('👨‍⚕️ Creating staff account...');

    const staffData = {
      email: 'doctor1@hospital.com',
      password: 'doctor123',
      first_name: 'Dr. John',
      last_name: 'Smith',
      role: 'doctor',
      position: 'Cardiologist',
      department_id: 3,
      contact_number: '+84901234567'
    };

    // Check if email already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: staffData.email }
    });

    if (existingUser) {
      console.log('⚠️  User already exists with email:', staffData.email);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(staffData.password, 12);

    // Use transaction to create user, assign role, and create staff record
    const result = await prisma.$transaction(async (tx) => {
      // Step 1: Create user record for authentication
      const user = await tx.users.create({
        data: {
          email: staffData.email,
          password_hash: hashedPassword,
          is_active: true
        }
      });

      // Step 2: Get staff role and assign to user
      const staffRole = await tx.roles.findFirst({
        where: { role_name: staffData.role, is_active: true }
      });

      if (staffRole) {
        await tx.user_roles.create({
          data: {
            user_id: user.user_id,
            role_id: staffRole.role_id,
            assigned_at: new Date(),
            is_active: true
          }
        });
      }

      // Step 3: Create staff record with user_id link
      // Generate employee ID
      const employeeId = `EMP${Date.now()}`;
      
      const staff = await tx.staff.create({
        data: {
          employee_id: employeeId,
          user_id: user.user_id,
          first_name: staffData.first_name,
          last_name: staffData.last_name,
          role: staffData.role,
          position: staffData.position,
          department_id: staffData.department_id,
          email: staffData.email,
          phone: staffData.contact_number,
          hire_date: new Date()
        }
      });

      return { user, staff, role: staffRole };
    });

    console.log('✅ Staff account created successfully!');
    console.log('📧 Email:', staffData.email);
    console.log('🔑 Password:', staffData.password);
    console.log('👤 User ID:', result.user.user_id);
    console.log('🏥 Staff ID:', result.staff.staff_id);
    console.log('🔐 Role:', result.role?.role_name || staffData.role);

  } catch (error) {
    console.error('❌ Error creating staff account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffAccount();