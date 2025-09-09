const { prisma } = require('../config/prisma');

class ReportsController {
  // Get patient history report
  async getPatientHistory(req, res) {
    try {
      const { id } = req.params;

      // Get patient basic info
      const patient = await prisma.patients.findUnique({
        where: { patient_id: Number(id) }
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient not found'
        });
      }

      // Get appointments
      const appointments = await prisma.appointments.findMany({
        where: { patient_id: Number(id) },
        include: {
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        orderBy: { appointment_date: 'desc' }
      });

      // Get medical records
      const medicalRecords = await prisma.medical_records.findMany({
        where: { patient_id: Number(id) },
        include: {
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        orderBy: { visit_date: 'desc' }
      });

      // Get prescriptions
      const prescriptions = await prisma.prescriptions.findMany({
        where: { patient_id: Number(id) },
        include: {
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        orderBy: { prescription_date: 'desc' }
      });

      // Get billing history
      const billing = await prisma.billing.findMany({
        where: { patient_id: Number(id) },
        orderBy: { billing_date: 'desc' }
      });

      // Get pharmacy history
      const pharmacy = await prisma.pharmacy.findMany({
        where: { patient_id: Number(id) },
        include: {
          medicine: {
            select: {
              medicine_id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: { dispensed_date: 'desc' }
      });

      res.json({
        success: true,
        data: {
          patient,
          appointments,
          medicalRecords,
          prescriptions,
          billing,
          pharmacy
        }
      });
    } catch (error) {
      console.error('Get patient history error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get doctor appointments report
  async getDoctorAppointments(req, res) {
    try {
      const { id } = req.params;
      const { date_from, date_to, status } = req.query;

      // Get doctor basic info
      const doctor = await prisma.doctors.findUnique({
        where: { doctor_id: Number(id) }
      });

      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }

      const where = {
        doctor_id: Number(id),
        ...(date_from || date_to ? {
          appointment_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {}),
        ...(status ? { status } : {})
      };

      const appointments = await prisma.appointments.findMany({
        where,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              contact_number: true,
              email: true
            }
          }
        },
        orderBy: { appointment_date: 'desc' }
      });

      // Calculate statistics
      const stats = appointments.reduce((acc, appointment) => {
        acc.total++;
        acc.byStatus[appointment.status] = (acc.byStatus[appointment.status] || 0) + 1;
        
        const date = appointment.appointment_date;
        acc.byDate[date] = (acc.byDate[date] || 0) + 1;
        
        return acc;
      }, {
        total: 0,
        byStatus: {},
        byDate: {}
      });

      res.json({
        success: true,
        data: {
          doctor,
          appointments,
          statistics: stats
        }
      });
    } catch (error) {
      console.error('Get doctor appointments error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get room usage report
  async getRoomUsage(req, res) {
    try {
      const { date_from, date_to } = req.query;

      // Get all rooms with their types
      const rooms = await prisma.rooms.findMany({
        include: {
          room_type: {
            select: {
              room_type_id: true,
              room_type_name: true
            }
          }
        }
      });

      // Get room assignments
      const where = {
        ...(date_from || date_to ? {
          start_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const assignments = await prisma.room_assignments.findMany({
        where,
        include: {
          room: {
            select: {
              room_id: true,
              room_number: true,
              room_type: {
                select: {
                  room_type_name: true
                }
              }
            }
          },
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true,
              role: true
            }
          }
        },
        orderBy: { start_date: 'desc' }
      });

      // Calculate room usage statistics
      const roomStats = rooms.map(room => {
        const roomAssignments = assignments.filter(a => a.room_id === room.room_id);
        const activeAssignments = roomAssignments.filter(a => !a.end_date);
        
        return {
          ...room,
          totalAssignments: roomAssignments.length,
          activeAssignments: activeAssignments.length,
          isCurrentlyOccupied: activeAssignments.length > 0,
          assignments: roomAssignments
        };
      });

      // Overall statistics
      const overallStats = {
        totalRooms: rooms.length,
        occupiedRooms: roomStats.filter(r => r.isCurrentlyOccupied).length,
        availableRooms: roomStats.filter(r => !r.isCurrentlyOccupied).length,
        occupancyRate: (roomStats.filter(r => r.isCurrentlyOccupied).length / rooms.length * 100).toFixed(2),
        byRoomType: {}
      };

      // Group by room type
      rooms.forEach(room => {
        const typeName = room.room_types?.type_name || 'Unknown';
        if (!overallStats.byRoomType[typeName]) {
          overallStats.byRoomType[typeName] = {
            total: 0,
            occupied: 0,
            available: 0
          };
        }
        
        overallStats.byRoomType[typeName].total++;
        
        const isOccupied = roomStats.find(r => r.id === room.id)?.isCurrentlyOccupied;
        if (isOccupied) {
          overallStats.byRoomType[typeName].occupied++;
        } else {
          overallStats.byRoomType[typeName].available++;
        }
      });

      res.json({
        success: true,
        data: {
          rooms: roomStats,
          statistics: overallStats
        }
      });
    } catch (error) {
      console.error('Get room usage error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get billing summary report
  async getBillingSummary(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const where = {
        ...(date_from || date_to ? {
          billing_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const billingRecords = await prisma.billing.findMany({
        where,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          }
        },
        orderBy: { billing_date: 'desc' }
      });

      // Calculate summary statistics
      const summary = billingRecords.reduce((acc, record) => {
        const amount = parseFloat(record.total_amount || 0);
        
        acc.totalRevenue += amount;
        acc.totalRecords++;
        
        if (record.payment_status === 'PAID') {
          acc.paidAmount += amount;
          acc.paidCount++;
        } else if (record.payment_status === 'PENDING') {
          acc.pendingAmount += amount;
          acc.pendingCount++;
        } else if (record.payment_status === 'OVERDUE') {
          acc.overdueAmount += amount;
          acc.overdueCount++;
        }
        
        // Group by date
        const date = record.billing_date;
        if (!acc.byDate[date]) {
          acc.byDate[date] = { amount: 0, count: 0 };
        }
        acc.byDate[date].amount += amount;
        acc.byDate[date].count++;
        
        // Group by payment status
        acc.byStatus[record.payment_status] = (acc.byStatus[record.payment_status] || 0) + amount;
        
        return acc;
      }, {
        totalRevenue: 0,
        totalRecords: 0,
        paidAmount: 0,
        paidCount: 0,
        pendingAmount: 0,
        pendingCount: 0,
        overdueAmount: 0,
        overdueCount: 0,
        byDate: {},
        byStatus: {}
      });

      // Calculate collection rate
      summary.collectionRate = summary.totalRevenue > 0 
        ? (summary.paidAmount / summary.totalRevenue * 100).toFixed(2)
        : 0;

      res.json({
        success: true,
        data: {
          summary,
          records: billingRecords
        }
      });
    } catch (error) {
      console.error('Get billing summary error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ReportsController();
