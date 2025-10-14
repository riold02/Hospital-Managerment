const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPatients() {
  try {
    console.log('Checking patients in database...\n');
    
    const patients = await prisma.patients.findMany({ 
      take: 5,
      select: {
        patient_id: true,
        first_name: true,
        last_name: true,
        gender: true,
        date_of_birth: true,
        phone: true,
        email: true,
        blood_type: true,
        allergies: true,
        medical_history: true
      }
    });
    
    console.log(`Total patients checked: ${patients.length}\n`);
    
    if (patients.length > 0) {
      console.log('=== PATIENT DATA ===\n');
      patients.forEach((patient, index) => {
        console.log(`${index + 1}. ID: ${patient.patient_id}`);
        console.log(`   Name: ${patient.first_name} ${patient.last_name}`);
        console.log(`   Gender: ${patient.gender || 'NULL'}`);
        console.log(`   Date of Birth: ${patient.date_of_birth || 'NULL'}`);
        console.log(`   Phone: ${patient.phone || 'NULL'}`);
        console.log(`   Email: ${patient.email || 'NULL'}`);
        console.log(`   Blood Type: ${patient.blood_type || 'NULL'}`);
        console.log(`   Allergies: ${patient.allergies || 'NULL'}`);
        console.log(`   Medical History: ${patient.medical_history || 'NULL'}`);
        console.log('');
      });
      
      // Also check appointments with patient data
      console.log('\n=== CHECKING APPOINTMENTS WITH PATIENT DATA ===\n');
      const appointments = await prisma.appointments.findMany({
        take: 3,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              gender: true,
              date_of_birth: true,
              phone: true
            }
          }
        }
      });
      
      console.log(`Total appointments checked: ${appointments.length}\n`);
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. Appointment ID: ${apt.appointment_id}`);
        console.log(`   Patient: ${apt.patient?.first_name} ${apt.patient?.last_name}`);
        console.log(`   Gender: ${apt.patient?.gender || 'NULL'}`);
        console.log(`   Phone: ${apt.patient?.phone || 'NULL'}`);
        console.log('');
      });
      
    } else {
      console.log('No patients found in database');
    }
  } catch (error) {
    console.error('Database error:', error);
    console.error('Error details:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPatients();
