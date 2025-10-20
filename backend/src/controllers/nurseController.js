const { prisma } = require('../config/prisma');

/**
 * Nurse Dashboard Controller
 * Handles nurse-specific functionality for patient care
 */

// Get nurse dashboard overview
const getNurseDashboard = async (req, res) => {
  try {
    const nurseId = req.user.user_id;
    
    const [
      assignedPatients,
      todayMedications,
      vitalSignsPending,
      criticalAlerts,
      shiftInfo,
      recentActivities
    ] = await Promise.all([
      // Assigned inpatients
      prisma.room_assignments.findMany({
        where: {
          end_date: null
        },
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              date_of_birth: true,
              medical_history: true
            }
          },
          room: {
            select: {
              room_number: true
            }
          }
        }
      }),
      
      // Today's medications to administer
      prisma.prescriptions.findMany({
        where: {
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          patient: {
            room_assignments: {
              some: {
                end_date: null
              }
            }
          }
        },
        include: {
          items: {
            include: {
              medicine: true
            }
          },
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true
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
        }
      }),
      
      // Patients needing vital signs check
      prisma.room_assignments.count({
        where: {
          end_date: null,
          patient: {
            medical_records: {
              some: {
                created_at: {
                  lt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
                }
              }
            }
          }
        }
      }),
      
      // Critical alerts count
      prisma.patients.count({
        where: {
          medical_history: {
            contains: 'critical'
          },
          room_assignments: {
            some: {
              end_date: null
            }
          }
        }
      }),
      
      // Current shift info
      prisma.staff.findFirst({
        where: {
          user_id: nurseId
        },
        include: {
          departments: true
        }
      }),
      
      // Recent medical records
      prisma.medical_records.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        where: {
          patient: {
            room_assignments: {
              some: {
                end_date: null
              }
            }
          }
        },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        }
      })
    ]);

    // Get today's appointments count
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await prisma.appointments.count({
      where: {
        appointment_date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Get total patients count
    const totalPatients = await prisma.patients.count();

    const dashboardData = {
      // Frontend expects these exact field names
      totalPatients: totalPatients,
      activeRoomAssignments: assignedPatients.length,
      totalMedicine: todayMedications.reduce((sum, p) => sum + (p.items?.length || 0), 0),
      todayAppointments: todayAppointments,
      // Additional data for detailed views
      overview: {
        assignedPatients: assignedPatients.length,
        todayMedications: todayMedications.reduce((sum, p) => sum + (p.items?.length || 0), 0),
        vitalSignsPending,
        criticalAlerts
      },
      assignedPatients,
      todayMedications,
      shiftInfo,
      recentActivities
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching nurse dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nurse dashboard data'
    });
  }
};

// Get patients assigned to nurse
const getAssignedPatients = async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log('🔍 getAssignedPatients - userId:', userId);
    
    // First get the nurse staff record for this user
    const nurse = await prisma.staff.findFirst({
      where: {
        user_id: userId,
        role: 'nurse'
      }
    });

    console.log('🔍 Found nurse:', nurse);

    if (!nurse) {
      console.log('❌ Nurse profile not found for userId:', userId);
      return res.status(404).json({
        success: false,
        error: 'Nurse profile not found'
      });
    }

    // Get nurse-patient assignments
    const assignments = await prisma.nurse_patient_assignments.findMany({
      where: {
        nurse_id: nurse.staff_id,
        status: 'active',
        OR: [
          { end_date: null },
          { end_date: { gte: new Date() } }
        ]
      },
      include: {
        patient: {
          include: {
            medical_records: {
              orderBy: { created_at: 'desc' },
              take: 1
            },
            room_assignments: {
              where: {
                end_date: null
              },
              include: {
                room: {
                  select: {
                    room_id: true,
                    room_number: true,
                    capacity: true,
                    status: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('🔍 Found assignments:', assignments.length);

    // Transform data to match frontend expectations
    const transformedData = assignments.map(assignment => ({
      assignment_id: assignment.assignment_id,
      room_id: assignment.patient.room_assignments[0]?.room_id || null,
      patient_id: assignment.patient.patient_id,
      assignment_type: 'PATIENT',
      start_date: assignment.start_date,
      end_date: assignment.end_date,
      patient: assignment.patient,
      room: assignment.patient.room_assignments[0]?.room || null
    }));

    console.log('🔍 Transformed data:', transformedData.length);

    res.json({
      success: true,
      data: transformedData
    });
  } catch (error) {
    console.error('Error fetching assigned patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned patients'
    });
  }
};

// Record vital signs
const recordVitalSigns = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      blood_pressure_systolic,
      blood_pressure_diastolic,
      heart_rate,
      temperature,
      respiratory_rate,
      oxygen_saturation,
      notes
    } = req.body;

    // Create medical record entry for vital signs
    const vitalSigns = await prisma.medical_record.create({
      data: {
        patient_id: patientId,
        record_type: 'Vital Signs',
        diagnosis: `BP: ${blood_pressure_systolic}/${blood_pressure_diastolic}, HR: ${heart_rate}, Temp: ${temperature}°C, RR: ${respiratory_rate}, SpO2: ${oxygen_saturation}%`,
        treatment: notes || '',
        recorded_by: req.user.user_id
      }
    });

    res.json({
      success: true,
      data: vitalSigns,
      message: 'Vital signs recorded successfully'
    });
  } catch (error) {
    console.error('Error recording vital signs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record vital signs'
    });
  }
};

// Get medication schedule
const getMedicationSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Get prescriptions from last 7 days instead of just today
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const medications = await prisma.prescriptions.findMany({
      where: {
        created_at: {
          gte: sevenDaysAgo
        }
      },
      include: {
        items: {
          include: {
            medicine: true
          }
        },
        patient: {
          select: {
            patient_id: true,
            first_name: true,
            last_name: true,
            room_assignments: {
              where: {
                end_date: null
              },
              include: {
                room: true
              }
            }
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
      }
    });

    res.json({
      success: true,
      data: medications
    });
  } catch (error) {
    console.error('Error fetching medication schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch medication schedule'
    });
  }
};

// Record medication administration
const recordMedicationAdministration = async (req, res) => {
  try {
    const { prescriptionItemId } = req.params;
    const { administered_at, notes, dose_given } = req.body;

    // Record in pharmacy records
    const administration = await prisma.pharmacy_record.create({
      data: {
        prescription_id: prescriptionItemId,
        dispensed_by: req.user.user_id,
        quantity_dispensed: dose_given || 1,
        notes: notes || '',
        dispensed_at: administered_at ? new Date(administered_at) : new Date()
      }
    });

    res.json({
      success: true,
      data: administration,
      message: 'Medication administration recorded successfully'
    });
  } catch (error) {
    console.error('Error recording medication administration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record medication administration'
    });
  }
};

// Create nursing note
const createNursingNote = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { note_type, content, priority } = req.body;

    const nursingNote = await prisma.medical_record.create({
      data: {
        patient_id: patientId,
        record_type: note_type || 'Nursing Note',
        diagnosis: content,
        treatment: priority || 'Normal',
        recorded_by: req.user.user_id
      }
    });

    res.json({
      success: true,
      data: nursingNote,
      message: 'Nursing note created successfully'
    });
  } catch (error) {
    console.error('Error creating nursing note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create nursing note'
    });
  }
};

module.exports = {
  getNurseDashboard,
  getAssignedPatients,
  recordVitalSigns,
  getMedicationSchedule,
  recordMedicationAdministration,
  createNursingNote
};
