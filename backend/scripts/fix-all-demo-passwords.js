const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixAllDemoPasswords() {
  try {
    console.log('🔧 Fixing all demo account passwords...\n');

    // Generate correct hash for "Demo1234"
    const correctHash = await bcrypt.hash('Demo1234', 10);
    console.log('✅ Generated new password hash\n');

    // List of demo accounts to fix
    const demoAccounts = [
      { email: 'admin@demo.com', role: 'Admin' },
      { email: 'doctor@demo.com', role: 'Doctor' },
      { email: 'nurse@demo.com', role: 'Nurse' },
      { email: 'pharmacist@demo.com', role: 'Pharmacist' },
      { email: 'technician@demo.com', role: 'Technician' },
      { email: 'driver@demo.com', role: 'Driver' },
    ];

    for (const account of demoAccounts) {
      try {
        const result = await prisma.users.updateMany({
          where: { email: account.email },
          data: { password_hash: correctHash }
        });

        if (result.count > 0) {
          console.log(`✅ ${account.role.padEnd(12)} (${account.email})`);
        } else {
          console.log(`⚠️  ${account.role.padEnd(12)} (${account.email}) - Not found, skipping`);
        }
      } catch (error) {
        console.log(`❌ ${account.role.padEnd(12)} (${account.email}) - Error: ${error.message}`);
      }
    }

    console.log('\n✅ All demo passwords have been updated!');
    console.log('🔑 Password for all demo accounts: Demo1234\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllDemoPasswords();

