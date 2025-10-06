const prisma = require('../config/prisma');

/**
 * Admin Dashboard Controller
 * Handles admin-specific functionality and system overview
 */

// Get admin dashboard overview
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalDoctors,
      totalStaff,
      totalAppointments,
      todayAppointments,
      totalDepartments,
      totalRooms,
      recentActivities
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total patients
      prisma.patient.count(),
      
      // Total doctors
      prisma.doctor.count(),
      
      // Total staff
      prisma.staff.count(),
      
      // Total appointments
      prisma.appointment.count(),
      
      // Today's appointments
      prisma.appointment.count({
        where: {
          appointment_date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Total departments
      prisma.department.count(),
      
      // Total rooms
      prisma.room.count(),
      
      // Recent user registrations (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
          user_id: true,
          email: true,
          role: true,
          created_at: true
        }
      })
    ]);

    const dashboardData = {
      overview: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalStaff,
        totalAppointments,
        todayAppointments,
        totalDepartments,
        totalRooms
      },
      recentActivities,
      systemHealth: {
        database: 'healthy',
        server: 'running',
        lastBackup: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin dashboard data'
    });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const [
      usersByRole,
      appointmentsByStatus,
      departmentStats,
      roomOccupancy
    ] = await Promise.all([
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true
        }
      }),
      
      // Appointments by status
      prisma.appointment.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // Department statistics
      prisma.department.findMany({
        include: {
          _count: {
            select: {
              doctor_department: true,
              staff: true,
              rooms: true
            }
          }
        }
      }),
      
      // Room occupancy
      prisma.room.findMany({
        include: {
          room_assignments: {
            where: {
              discharge_date: null
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        usersByRole,
        appointmentsByStatus,
        departmentStats,
        roomOccupancy: roomOccupancy.map(room => ({
          room_id: room.room_id,
          room_number: room.room_number,
          capacity: room.capacity,
          currentOccupancy: room.room_assignments.length,
          occupancyRate: room.capacity > 0 ? (room.room_assignments.length / room.capacity * 100) : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system statistics'
    });
  }
};

// Get all users for management
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (role) whereClause.role = role;
    if (status) whereClause.is_active = status === 'active';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          user_id: true,
          email: true,
          role: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          last_login: true
        },
        orderBy: { created_at: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.user.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const user = await prisma.user.update({
      where: { user_id: userId },
      data: { is_active },
      select: {
        user_id: true,
        email: true,
        role: true,
        is_active: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
};

// Get system logs (mock implementation)
const getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, level } = req.query;

    // Mock system logs - in production, this would come from actual log files
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date(),
        level: 'info',
        message: 'User login successful',
        user_id: req.user.user_id,
        ip_address: req.ip
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 300000),
        level: 'warning',
        message: 'Failed login attempt',
        ip_address: req.ip
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 600000),
        level: 'error',
        message: 'Database connection timeout',
        details: 'Connection to database failed after 30 seconds'
      }
    ];

    res.json({
      success: true,
      data: mockLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: mockLogs.length,
        pages: 1,
        hasNext: false,
        hasPrev: false
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system logs'
    });
  }
};

module.exports = {
  getAdminDashboard,
  getSystemStats,
  getAllUsers,
  updateUserStatus,
  getSystemLogs
};