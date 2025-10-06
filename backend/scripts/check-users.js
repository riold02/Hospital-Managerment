const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    const users = await prisma.users.findMany({ take: 10 });
    console.log('Total users in database:', users.length);
    
    if (users.length > 0) {
      console.log('\nUsers found:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, Role: ${user.role}, Status: ${user.status}`);
      });
    } else {
      console.log('No users found in database');
    }
  } catch (error) {
    console.log('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();