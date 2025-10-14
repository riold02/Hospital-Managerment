const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class PharmacyController {
  // Get pharmacist dashboard overview
  async getPharmacistDashboard(req, res) {
    try {
      const [
        pendingPrescriptions,
        lowStockMedicines,
        todayDispensed,
        totalMedicines,
        expiringMedicines,
        recentPrescriptions
      ] = await Promise.all([
        // Pending prescriptions to dispense (Active status)
        prisma.prescriptions.count({
          where: {
            status: 'Active'
          }
        }),
        
        // Low stock medicines (stock < 100)
        prisma.medicine.count({
          where: {
            stock_quantity: {
              lt: 100
            }
          }
        }),
        
        // Today's dispensed medications
        prisma.pharmacy.count({
          where: {
            prescription_date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }),
        
        // Total medicines in inventory
        prisma.medicine.count(),
        
        // Medicines expiring in next 30 days
        prisma.medicine.count({
          where: {
            expiry_date: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Recent prescriptions
        prisma.prescriptions.findMany({
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
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
        })
      ]);

      const dashboardData = {
        overview: {
          pendingPrescriptions,
          lowStockMedicines,
          todayDispensed,
          totalMedicines,
          expiringMedicines
        },
        recentPrescriptions
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error fetching pharmacist dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pharmacist dashboard data'
      });
    }
  }

  // Get pending prescriptions (can filter by status)
  async getPendingPrescriptions(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const offset = (page - 1) * limit;

      // Build where clause
      const whereClause = {};
      if (status && status !== 'all') {
        // Map frontend status to database status
        if (status === 'Active') {
          whereClause.status = 'Active';
        } else if (status === 'Filled') {
          whereClause.status = 'Filled';
        } else {
          whereClause.status = status; // For Cancelled, Expired, Partially_Filled
        }
      } else if (!status) {
        // Default: only show Active (pending) prescriptions
        whereClause.status = 'Active';
      }
      // If status === 'all', whereClause is empty, get all prescriptions

      const [prescriptions, total] = await Promise.all([
        prisma.prescriptions.findMany({
          where: whereClause,
          include: {
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true,
                date_of_birth: true,
                phone: true
              }
            },
            doctor: {
              select: {
                doctor_id: true,
                first_name: true,
                last_name: true,
                specialty: true
              }
            },
            items: {
              include: {
                medicine: {
                  select: {
                    medicine_id: true,
                    name: true,
                    type: true,
                    brand: true,
                    stock_quantity: true
                  }
                }
              }
            }
          },
          orderBy: { created_at: 'desc' }, // Show newest first
          skip: parseInt(offset),
          take: parseInt(limit)
        }),
        prisma.prescriptions.count({
          where: whereClause
        })
      ]);

      res.json({
        success: true,
        data: prescriptions,
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
      console.error('Error fetching pending prescriptions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch pending prescriptions'
      });
    }
  }

  // Get medicine inventory with enhanced filtering
  async getMedicineInventory(req, res) {
    try {
      const { page = 1, limit = 20, search, category, lowStock } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      
      if (search) {
        whereClause.name = {
          contains: search,
          mode: 'insensitive'
        };
      }
      
      if (category) {
        whereClause.category = category;
      }
      
      if (lowStock === 'true') {
        whereClause.stock_quantity = {
          lt: 100
        };
      }

      const [medicines, total] = await Promise.all([
        prisma.medicine.findMany({
          where: whereClause,
          orderBy: { name: 'asc' },
          skip: parseInt(offset),
          take: parseInt(limit)
        }),
        prisma.medicine.count({ where: whereClause })
      ]);

      res.json({
        success: true,
        data: medicines,
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
      console.error('Error fetching medicine inventory:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch medicine inventory'
      });
    }
  }

  // Update medicine stock
  async updateMedicineStock(req, res) {
    try {
      const { medicineId } = req.params;
      const { stock_quantity, expiry_date, batch_number } = req.body;

      const medicine = await prisma.medicine.update({
        where: { medicine_id: parseInt(medicineId) },
        data: {
          stock_quantity: parseInt(stock_quantity),
          expiry_date: expiry_date ? new Date(expiry_date) : undefined,
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        data: medicine,
        message: 'Medicine stock updated successfully'
      });
    } catch (error) {
      console.error('Error updating medicine stock:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update medicine stock'
      });
    }
  }

  // Get expiring medicines
  async getExpiringMedicines(req, res) {
    try {
      const { days = 30 } = req.query;
      const expiryDate = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000);

      const medicines = await prisma.medicine.findMany({
        where: {
          expiry_date: {
            lte: expiryDate
          },
          stock_quantity: {
            gt: 0
          }
        },
        orderBy: { expiry_date: 'asc' }
      });

      res.json({
        success: true,
        data: medicines
      });
    } catch (error) {
      console.error('Error fetching expiring medicines:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch expiring medicines'
      });
    }
  }
  // Dispense medicine (create pharmacy record)
  async dispenseMedicine(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { prescription_id } = req.body;

      if (!prescription_id) {
        return res.status(400).json({
          success: false,
          error: 'prescription_id is required'
        });
      }

      // Get prescription with all items
      const prescription = await prisma.prescriptions.findUnique({
        where: { prescription_id: Number(prescription_id) },
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
          }
        }
      });

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      if (prescription.status === 'Filled') {
        return res.status(400).json({
          success: false,
          error: 'Đơn thuốc này đã được cấp phát rồi. Không thể cấp phát lại!'
        });
      }

      // Check stock for all items
      const stockChecks = prescription.items.map(item => {
        if (item.medicine.stock_quantity < item.quantity) {
          return {
            valid: false,
            medicine_name: item.medicine.name,
            stock: item.medicine.stock_quantity,
            required: item.quantity
          };
        }
        return { valid: true };
      });

      const insufficientStock = stockChecks.find(check => !check.valid);
      if (insufficientStock) {
        return res.status(400).json({
          success: false,
          error: `Không đủ thuốc "${insufficientStock.medicine_name}" trong kho. Tồn kho: ${insufficientStock.stock}, Yêu cầu: ${insufficientStock.required}`
        });
      }

      // Use transaction to dispense all items
      const result = await prisma.$transaction(async (tx) => {
        const pharmacyRecords = [];

        // Create pharmacy record for each item and update stock
        for (const item of prescription.items) {
          // Create pharmacy record
          const pharmacyRecord = await tx.pharmacy.create({
            data: {
              patient_id: prescription.patient_id,
              medicine_id: item.medicine_id,
              quantity: item.quantity,
              dispensed_by_user_id: req.user.user_id,
              prescription_date: new Date()
            }
          });

          pharmacyRecords.push(pharmacyRecord);

          // Update medicine stock
          await tx.medicine.update({
            where: { medicine_id: item.medicine_id },
            data: { 
              stock_quantity: item.medicine.stock_quantity - item.quantity
            }
          });
        }

        // Update prescription status to Filled
        await tx.prescriptions.update({
          where: { prescription_id: Number(prescription_id) },
          data: { status: 'Filled' }
        });

        return pharmacyRecords;
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Medicine dispensed successfully'
      });
    } catch (error) {
      console.error('Dispense medicine error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all pharmacy records
  async getAllPharmacyRecords(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        patient_id,
        medicine_id,
        dispensed_by,
        date_from,
        date_to,
        sortBy = 'prescription_date', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(medicine_id ? { medicine_id: Number(medicine_id) } : {}),
        ...(dispensed_by ? { dispensed_by_user_id: dispensed_by } : {}),
        ...(date_from || date_to ? {
          prescription_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const [data, count] = await Promise.all([
        prisma.pharmacy.findMany({
          where,
          include: {
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true
              }
            },
            medicine: {
              select: {
                medicine_id: true,
                name: true,
                type: true,
                brand: true
              }
            },
            dispensed_by_user: {
              select: {
                user_id: true,
                email: true,
                staff_member: {
                  select: {
                    staff_id: true,
                    first_name: true,
                    last_name: true
                  }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.pharmacy.count({ where })
      ]);

      res.json({
        success: true,
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
          hasNext: offset + parseInt(limit) < count,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get all pharmacy records error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get pharmacy record by ID
  async getPharmacyRecordById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.pharmacy.findUnique({
        where: { pharmacy_id: Number(id) },
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              contact_number: true,
              address: true
            }
          },
          medicine: {
            select: {
              medicine_id: true,
              name: true,
              type: true,
              brand: true,
              dosage: true
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true,
              position: true
            }
          }
        }
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Pharmacy record not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get pharmacy record by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get patient's pharmacy history
  async getPatientPharmacyHistory(req, res) {
    try {
      const { patient_id } = req.params;

      const data = await prisma.pharmacy.findMany({
        where: { patient_id: Number(patient_id) },
        include: {
          medicine: {
            select: {
              medicine_id: true,
              name: true,
              type: true,
              brand: true
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: { dispensed_date: 'desc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get patient pharmacy history error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get medicine dispensing history
  async getMedicineDispensingHistory(req, res) {
    try {
      const { medicine_id } = req.params;

      const data = await prisma.pharmacy.findMany({
        where: { medicine_id: Number(medicine_id) },
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: { dispensed_date: 'desc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get medicine dispensing history error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get pharmacy statistics
  async getPharmacyStats(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const where = {
        ...(date_from || date_to ? {
          dispensed_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const data = await prisma.pharmacy.findMany({
        where,
        select: { quantity: true, medicine_id: true, dispensed_date: true }
      });

      const stats = data.reduce((acc, record) => {
        acc.totalDispensed += parseInt(record.quantity || 0);
        acc.totalTransactions++;
        
        // Count by medicine
        acc.byMedicine[record.medicine_id] = (acc.byMedicine[record.medicine_id] || 0) + parseInt(record.quantity || 0);
        
        return acc;
      }, {
        totalDispensed: 0,
        totalTransactions: 0,
        byMedicine: {}
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get pharmacy stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get daily dispensing report
  async getDailyDispensingReport(req, res) {
    try {
      const { date = new Date().toISOString().split('T')[0] } = req.query;

      const data = await prisma.pharmacy.findMany({
        where: { dispensed_date: new Date(date) },
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true
            }
          },
          medicine: {
            select: {
              medicine_id: true,
              name: true,
              type: true
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      const summary = data.reduce((acc, record) => {
        acc.totalQuantity += parseInt(record.quantity || 0);
        acc.totalTransactions++;
        return acc;
      }, {
        totalQuantity: 0,
        totalTransactions: 0
      });

      res.json({
        success: true,
        data: {
          date,
          summary,
          records: data
        }
      });
    } catch (error) {
      console.error('Get daily dispensing report error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PharmacyController();
