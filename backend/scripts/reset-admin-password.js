const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...');
    
    // Hash new password
    const newPassword = 'admin123456';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('New hash:', hashedPassword);
    
    // Update admin password
    const result = await prisma.users.update({
      where: { email: 'admin@hospital.com' },
      data: { 
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });
    
    console.log('✅ Admin password updated successfully!');
    console.log('📧 Email: admin@hospital.com');
    console.log('🔑 Password: admin123456');
    
    // Test password verification
    const testVerify = await bcrypt.compare(newPassword, hashedPassword);
    console.log('🧪 Password verification test:', testVerify ? 'PASS' : 'FAIL');
    
  } catch (error) {
    console.error('❌ Error resetting admin password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();