const { prisma } = require('../config/prisma');

/**
 * Doctor Dashboard Controller
 * Handles doctor-specific functionality for patient care and appointments
 */

// Get doctor dashboard overview
const getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.user.user_id;
    
    const [
      totalPatients,
      todayAppointments,
      totalAppointments,
      totalPrescriptions
    ] = await Promise.all([
      // Total patients
      prisma.patients.count(),
      
      // Today's appointments
      prisma.appointments.count({
        where: {
          appointment_date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Total appointments
      prisma.appointments.count(),
      
      // Total prescriptions
      prisma.prescriptions.count()
    ]);

    const dashboardData = {
      overview: {
        totalPatients,
        todayAppointments,
        totalAppointments,
        totalPrescriptions
      },
      doctorInfo: {
        doctor_id: req.user.user_id,
        staff_id: req.user.staff_id
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching doctor dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor dashboard data'
    });
  }
};

// Get doctor appointments
const getDoctorAppointments = async (req, res) => {
  try {
    const { date, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get doctor_id from user_id
    const doctor = await prisma.doctors.findFirst({
      where: { user_id: req.user.user_id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor record not found'
      });
    }

    const where = {
      doctor_id: doctor.doctor_id, // Filter by logged-in doctor
      ...(date ? {
        appointment_date: {
          gte: new Date(date),
          lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
        }
      } : {}),
      ...(status ? { status } : {})
    };

    const [appointments, count] = await Promise.all([
      prisma.appointments.findMany({
        where,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              phone: true,
              date_of_birth: true,
              gender: true,
              blood_type: true,
              allergies: true,
              medical_history: true,
              address: true,
              email: true
            }
          }
        },
        skip: Number(offset),
        take: Number(limit),
        orderBy: { appointment_date: 'asc' }
      }),
      prisma.appointments.count({ where })
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor appointments'
    });
  }
};

// Get doctor patients
const getDoctorPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = search ? {
      OR: [
        { first_name: { contains: search, mode: 'insensitive' } },
        { last_name: { contains: search, mode: 'insensitive' } },
        { patient_code: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [patients, count] = await Promise.all([
      prisma.patients.findMany({
        where,
        select: {
          patient_id: true,
          patient_code: true,
          first_name: true,
          last_name: true,
          date_of_birth: true,
          gender: true,
          phone: true,
          email: true,
          blood_type: true,
          allergies: true,
          medical_history: true,
          address: true
        },
        skip: Number(offset),
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.patients.count({ where })
    ]);

    res.json({
      success: true,
      data: patients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor patients'
    });
  }
};

// Get patient medical records
const getPatientMedicalRecords = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [records, count] = await Promise.all([
      prisma.medical_records.findMany({
        where: { patient_id: Number(patientId) },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              patient_code: true
            }
          }
        },
        skip: Number(offset),
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.medical_records.count({
        where: { patient_id: Number(patientId) }
      })
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching patient medical records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient medical records'
    });
  }
};

// Get doctor prescriptions
const getDoctorPrescriptions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = status ? { status } : {};

    const [prescriptions, count] = await Promise.all([
      prisma.prescriptions.findMany({
        where,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              patient_code: true
            }
          },
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        skip: Number(offset),
        take: Number(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.prescriptions.count({ where })
    ]);

    res.json({
      success: true,
      data: prescriptions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching doctor prescriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor prescriptions'
    });
  }
};

// Get doctor schedule
const getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.user_id;

    // Try to get doctor info from doctors table
    const doctor = await prisma.doctors.findFirst({
      where: { user_id: doctorId },
      select: {
        doctor_id: true,
        first_name: true,
        last_name: true,
        specialty: true,
        available_schedule: true
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const scheduleData = {
      doctor_info: doctor,
      today_schedule: doctor.available_schedule || 'No schedule set',
      upcoming_appointments: []
    };

    res.json({
      success: true,
      data: scheduleData
    });
  } catch (error) {
    console.error('Error fetching doctor schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor schedule'
    });
  }
};

// Update doctor schedule
const updateDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.user_id;
    const { available_schedule } = req.body;

    const updatedDoctor = await prisma.doctors.updateMany({
      where: { user_id: doctorId },
      data: { available_schedule }
    });

    if (updatedDoctor.count === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor schedule updated successfully',
      data: { available_schedule }
    });
  } catch (error) {
    console.error('Error updating doctor schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update doctor schedule'
    });
  }
};

// Get doctor's medical records
const getDoctorMedicalRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10, patient_id } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (patient_id) {
      where.patient_id = parseInt(patient_id);
    }

    const [records, total] = await Promise.all([
      prisma.medical_records.findMany({
        where,
        include: {
          patient: {
            select: {
              patient_id: true,
              patient_code: true,
              first_name: true,
              last_name: true,
              date_of_birth: true,
              gender: true,
              phone: true,
              address: true,
              allergies: true
            }
          },
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.medical_records.count({ where })
    ]);

    res.json({
      success: true,
      data: records,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get doctor medical records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get doctor statistics
const getDoctorStatistics = async (req, res) => {
  try {
    // Get all doctors with their specialties
    const doctors = await prisma.staff.findMany({
      where: {
        position: {
          contains: 'Bác sĩ'
        }
      },
      include: {
        departments: {
          select: {
            department_name: true
          }
        }
      }
    });

    // Count by specialty (department)
    const specialties = {};
    doctors.forEach(doctor => {
      const specialty = doctor.departments?.department_name || 'Chưa phân loại';
      specialties[specialty] = (specialties[specialty] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total: doctors.length,
        specialties,
        uniqueSpecialties: Object.keys(specialties).length
      }
    });
  } catch (error) {
    console.error('Get doctor statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorPatients,
  getPatientMedicalRecords,
  getDoctorPrescriptions,
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorMedicalRecords,
  getDoctorStatistics
};
