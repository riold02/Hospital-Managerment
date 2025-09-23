const { prisma } = require('../config/prisma');

class DashboardController {
  // Get dashboard KPIs
  async getDashboardKPIs(req, res) {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // Get today's appointments count
      const todayAppointments = await prisma.appointments.count({
        where: {
          appointment_date: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: {
            not: 'Cancelled'
          }
        }
      });

      // Get room occupancy (rooms that are occupied)
      const totalRooms = await prisma.rooms.count();
      const occupiedRooms = await prisma.room_assignments.count({
        where: {
          end_date: null, // Currently assigned
          assignment_type: 'Patient'
        }
      });
      const roomOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Get monthly revenue from billing
      const monthlyBilling = await prisma.billing.aggregate({
        where: {
          created_at: {
            gte: startOfMonth,
            lt: endOfMonth
          },
          payment_status: 'Paid'
        },
        _sum: {
          total_amount: true
        }
      });
      const monthlyRevenue = monthlyBilling._sum.total_amount || 0;

      // Get expiring medicine count (expire within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const expiringMedicine = await prisma.medicine.count({
        where: {
          expiry_date: {
            lte: thirtyDaysFromNow,
            gte: today
          },
          stock_quantity: {
            gt: 0
          }
        }
      });

      const kpiData = {
        todayAppointments: todayAppointments || 0,
        roomOccupancy: roomOccupancy || 0,
        monthlyRevenue: monthlyRevenue ? Number(monthlyRevenue) : 0,
        expiringMedicine: expiringMedicine || 0
      };

      res.json({
        success: true,
        data: kpiData
      });

    } catch (error) {
      console.error('Get dashboard KPIs error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get dashboard overview data
  async getDashboardOverview(req, res) {
    try {
      const today = new Date();
      const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      
      // Recent appointments
      const recentAppointments = await prisma.appointments.findMany({
        where: {
          appointment_date: {
            gte: startOfWeek
          }
        },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          doctor: {
            select: {
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        orderBy: {
          appointment_date: 'desc'
        },
        take: 10
      });

      // Recent billing
      const recentBilling = await prisma.billing.findMany({
        where: {
          billing_date: {
            gte: startOfWeek
          }
        },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: {
          billing_date: 'desc'
        },
        take: 10
      });

      // System alerts
      const alerts = [];
      
      // Check for overdue bills
      const overdueBills = await prisma.billing.count({
        where: {
          status: 'Pending',
          billing_date: {
            lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
          }
        }
      });
      
      if (overdueBills > 0) {
        alerts.push({
          type: 'warning',
          message: `${overdueBills} hóa đơn quá hạn thanh toán`,
          action: 'view_billing'
        });
      }

      // Check for low stock medicine
      const lowStockMedicine = await prisma.medicine.count({
        where: {
          quantity_in_stock: {
            lt: 10
          }
        }
      });
      
      if (lowStockMedicine > 0) {
        alerts.push({
          type: 'warning',
          message: `${lowStockMedicine} loại thuốc sắp hết hàng`,
          action: 'view_medicine'
        });
      }

      res.json({
        success: true,
        data: {
          recentAppointments,
          recentBilling,
          alerts
        }
      });

    } catch (error) {
      console.error('Get dashboard overview error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DashboardController();
