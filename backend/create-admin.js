const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAdminUser() {
  const email = 'admin@hospital.com';
  const password = 'Admin123';
  const userId = uuidv4();
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  console.log('User ID:', userId);
  console.log('Email:', email);
  console.log('Password Hash:', passwordHash);
  console.log('Password (plaintext):', password);
  
  // SQL commands to create user
  console.log('\n--- SQL Commands ---');
  console.log(`INSERT INTO users (user_id, email, password_hash, is_active, created_at, updated_at) VALUES ('${userId}', '${email}', '${passwordHash}', true, NOW(), NOW());`);
  console.log(`INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by) VALUES ('${userId}', 1, NOW(), '${userId}');`);
}

createAdminUser().catch(console.error);