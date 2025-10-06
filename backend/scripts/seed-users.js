const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Starting to seed users...');
  
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123', 10);
    const admin = await prisma.users.create({
      data: {
        email: 'admin@hospital.vn',
        password: adminPassword,
        full_name: 'Hospital Administrator',
        role: 'admin',
        status: 'active',
        phone: '0901234567',
        address: 'Hospital Administration Office'
      }
    });
    console.log('✅ Created admin user:', admin.email);

    // Create doctor user
    const doctorPassword = await bcrypt.hash('Demo1234', 10);
    const doctor = await prisma.users.create({
      data: {
        email: 'bs.lethij@hospital.vn',
        password: doctorPassword,
        full_name: 'Dr. Le Thi J',
        role: 'doctor',
        status: 'active',
        phone: '0901234568',
        address: 'Cardiology Department'
      }
    });
    console.log('✅ Created doctor user:', doctor.email);

    // Create nurse user
    const nursePassword = await bcrypt.hash('Nurse123', 10);
    const nurse = await prisma.users.create({
      data: {
        email: 'nurse.anna@hospital.vn',
        password: nursePassword,
        full_name: 'Anna Nguyen',
        role: 'nurse',
        status: 'active',
        phone: '0901234569',
        address: 'Ward 1'
      }
    });
    console.log('✅ Created nurse user:', nurse.email);

    // Create pharmacist user
    const pharmacistPassword = await bcrypt.hash('Pharm123', 10);
    const pharmacist = await prisma.users.create({
      data: {
        email: 'pharm.john@hospital.vn',
        password: pharmacistPassword,
        full_name: 'John Smith',
        role: 'pharmacist',
        status: 'active',
        phone: '0901234570',
        address: 'Hospital Pharmacy'
      }
    });
    console.log('✅ Created pharmacist user:', pharmacist.email);

    // Create lab assistant user
    const labPassword = await bcrypt.hash('Lab123', 10);
    const labAssistant = await prisma.users.create({
      data: {
        email: 'lab.mary@hospital.vn',
        password: labPassword,
        full_name: 'Mary Johnson',
        role: 'lab_assistant',
        status: 'active',
        phone: '0901234571',
        address: 'Hospital Laboratory'
      }
    });
    console.log('✅ Created lab assistant user:', labAssistant.email);

    // Create driver user
    const driverPassword = await bcrypt.hash('Driver123', 10);
    const driver = await prisma.users.create({
      data: {
        email: 'driver.mike@hospital.vn',
        password: driverPassword,
        full_name: 'Mike Wilson',
        role: 'driver',
        status: 'active',
        phone: '0901234572',
        address: 'Ambulance Service'
      }
    });
    console.log('✅ Created driver user:', driver.email);

    // Create technician user
    const techPassword = await bcrypt.hash('Tech123', 10);
    const technician = await prisma.users.create({
      data: {
        email: 'tech.sarah@hospital.vn',
        password: techPassword,
        full_name: 'Sarah Brown',
        role: 'technician',
        status: 'active',
        phone: '0901234573',
        address: 'Medical Records Department'
      }
    });
    console.log('✅ Created technician user:', technician.email);

    // Create patient user
    const patientPassword = await bcrypt.hash('Patient123', 10);
    const patient = await prisma.users.create({
      data: {
        email: 'patient.demo@hospital.vn',
        password: patientPassword,
        full_name: 'Demo Patient',
        role: 'patient',
        status: 'active',
        phone: '0901234574',
        address: '123 Main Street, City'
      }
    });
    console.log('✅ Created patient user:', patient.email);

    console.log('\n🎉 Successfully seeded 8 users with all roles!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@hospital.vn / Admin123');
    console.log('Doctor: bs.lethij@hospital.vn / Demo1234');
    console.log('Nurse: nurse.anna@hospital.vn / Nurse123');
    console.log('Pharmacist: pharm.john@hospital.vn / Pharm123');
    console.log('Lab Assistant: lab.mary@hospital.vn / Lab123');
    console.log('Driver: driver.mike@hospital.vn / Driver123');
    console.log('Technician: tech.sarah@hospital.vn / Tech123');
    console.log('Patient: patient.demo@hospital.vn / Patient123');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();