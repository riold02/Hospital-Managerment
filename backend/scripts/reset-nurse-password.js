const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'nurse.test@hospital.com';
  const newPassword = 'Demo1234';
  const hash = await bcrypt.hash(newPassword, 12);
  console.log('New hash:', hash);
  const user = await prisma.users.update({ where: { email }, data: { password_hash: hash } });
  console.log('Updated user:', user.email);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});


