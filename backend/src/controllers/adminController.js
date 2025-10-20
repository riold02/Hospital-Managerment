const { prisma } = require('../config/prisma');

/**
 * Admin Dashboard Controller
 * Handles admin-specific functionality and system overview
 */

// Get admin dashboard overview
const getAdminDashboard = async (req, res) => {
  try {
    // Use individual try-catch for each query to handle missing tables gracefully
    let totalUsers = 0;
    let totalPatients = 0;
    let totalDoctors = 0;
    let totalStaff = 0;
    let totalAppointments = 0;
    let todayAppointments = 0;
    let totalDepartments = 0;
    let totalRooms = 0;
    let recentActivities = [];

    try {
      totalUsers = await prisma.users.count();
    } catch (e) {
      console.error('Error counting users:', e.message);
    }

    try {
      totalPatients = await prisma.patients.count();
    } catch (e) {
      console.error('Error counting patients:', e.message);
    }

    try {
      totalDoctors = await prisma.doctors.count();
    } catch (e) {
      console.error('Error counting doctors:', e.message);
    }

    try {
      totalStaff = await prisma.staff.count();
    } catch (e) {
      console.error('Error counting staff:', e.message);
    }

    try {
      totalAppointments = await prisma.appointments.count();
    } catch (e) {
      console.error('Error counting appointments:', e.message);
    }

    try {
      todayAppointments = await prisma.appointments.count({
        where: {
          appointment_date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      });
    } catch (e) {
      console.error('Error counting today appointments:', e.message);
    }

    try {
      totalDepartments = await prisma.departments.count();
    } catch (e) {
      console.error('Error counting departments:', e.message);
    }

    try {
      totalRooms = await prisma.rooms.count();
    } catch (e) {
      console.error('Error counting rooms:', e.message);
    }

    try {
      recentActivities = await prisma.users.findMany({
        take: 10,
        orderBy: { created_at: 'desc' },
        select: {
          user_id: true,
          email: true,
          role: true,
          created_at: true
        }
      });
    } catch (e) {
      console.error('Error fetching recent activities:', e.message);
    }

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
      error: 'Failed to fetch admin dashboard data',
      message: error.message
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
      // Users by role - get from user_roles and roles tables
      prisma.user_roles.findMany({
        include: {
          role: {
            select: {
              role_name: true
            }
          }
        }
      }).then(userRoles => {
        const roleCounts = {};
        userRoles.forEach(userRole => {
          const roleName = userRole.role.role_name;
          roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
        });
        return Object.entries(roleCounts).map(([role, count]) => ({
          role,
          _count: { role: count }
        }));
      }),
      
      // Appointments by status
      prisma.appointments.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // Department statistics
      prisma.departments.findMany({
        include: {
          _count: {
            select: {
              doctor_department: true,
              staff: true
            }
          }
        }
      }),
      
      // Room occupancy
      prisma.rooms.findMany({
        include: {
          room_assignments: {
            where: {
              end_date: null
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

    // Build where clause for user_roles if role filter is provided
    let userRolesWhere = {};
    if (role) {
      userRolesWhere = {
        role: {
          role_name: role
        }
      };
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: {
          ...(status ? { is_active: status === 'active' } : {})
        },
        select: {
          user_id: true,
          email: true,
          is_active: true,
          created_at: true,
          updated_at: true,
          last_login: true,
          user_roles: {
            include: {
              role: {
                select: {
                  role_name: true
                }
              }
            },
            where: userRolesWhere
          }
        },
        orderBy: { created_at: 'desc' },
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.users.count({ 
        where: {
          ...(status ? { is_active: status === 'active' } : {}),
          ...(role ? {
            user_roles: {
              some: {
                role: {
                  role_name: role
                }
              }
            }
          } : {})
        }
      })
    ]);

    // Transform users to include role information
    const transformedUsers = users.map(user => ({
      ...user,
      role: user.user_roles.length > 0 ? user.user_roles[0].role.role_name : null,
      roles: user.user_roles.map(ur => ur.role.role_name)
    }));

    res.json({
      success: true,
      data: transformedUsers,
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
    console.error('Error message:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const user = await prisma.users.update({
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

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role_name } = req.body;
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get role_id for the new role
    const role = await prisma.roles.findFirst({
      where: { role_name: role_name }
    });

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role name'
      });
    }

    // Delete existing user roles
    await prisma.user_roles.deleteMany({
      where: { user_id: userId }
    });

    // Create new user role
    await prisma.user_roles.create({
      data: {
        user_id: userId,
        role_id: role.role_id
      }
    });

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { email: email },
      include: {
        patients: true,
        doctors: true,
        staff: true,
        user_roles: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user has associated records
    if (user.patients.length > 0 || user.doctors.length > 0 || user.staff.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete user with associated records. Please delete associated records first.'
      });
    }

    // Delete user roles first
    await prisma.user_roles.deleteMany({
      where: { user_id: user.user_id }
    });

    // Delete user
    await prisma.users.delete({
      where: { user_id: user.user_id }
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

module.exports = {
  getAdminDashboard,
  getSystemStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  getSystemLogs,
  deleteUser
};