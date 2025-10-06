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
        // Pending prescriptions to dispense
        prisma.prescription.count({
          where: {
            pharmacy_records: {
              none: {}
            }
          }
        }),
        
        // Low stock medicines (stock < 10)
        prisma.medicine.count({
          where: {
            stock_quantity: {
              lt: 10
            }
          }
        }),
        
        // Today's dispensed medications
        prisma.pharmacy.count({
          where: {
            dispensed_date: {
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
        prisma.prescription.findMany({
          take: 10,
          orderBy: { created_at: 'desc' },
          include: {
            appointment: {
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
                    last_name: true
                  }
                }
              }
            },
            prescription_items: {
              include: {
                medicine: true
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

  // Get pending prescriptions
  async getPendingPrescriptions(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const [prescriptions, total] = await Promise.all([
        prisma.prescription.findMany({
          where: {
            pharmacy_records: {
              none: {}
            }
          },
          include: {
            appointment: {
              include: {
                patient: {
                  select: {
                    patient_id: true,
                    first_name: true,
                    last_name: true,
                    date_of_birth: true,
                    phone_number: true
                  }
                },
                doctor: {
                  select: {
                    first_name: true,
                    last_name: true,
                    specialty: true
                  }
                }
              }
            },
            prescription_items: {
              include: {
                medicine: {
                  select: {
                    medicine_id: true,
                    name: true,
                    dosage: true,
                    unit: true,
                    stock_quantity: true
                  }
                }
              }
            }
          },
          orderBy: { created_at: 'asc' },
          skip: parseInt(offset),
          take: parseInt(limit)
        }),
        prisma.prescription.count({
          where: {
            pharmacy_records: {
              none: {}
            }
          }
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
          lt: 10
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

      const { patient_id, medicine_id, quantity, prescription_id } = req.body;

      // Check if medicine exists and has sufficient stock
      const medicine = await prisma.medicine.findUnique({
        where: { medicine_id: Number(medicine_id) },
        select: { medicine_id: true, name: true, stock_quantity: true }
      });

      if (!medicine) {
        return res.status(404).json({
          success: false,
          error: 'Medicine not found'
        });
      }

      if (medicine.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Available: ${medicine.stock_quantity}, Requested: ${quantity}`
        });
      }

      // Use transaction to create pharmacy record and update stock
      const result = await prisma.$transaction(async (tx) => {
        // Create pharmacy record
        const pharmacyRecord = await tx.pharmacy.create({
          data: {
            patient_id: Number(patient_id),
            medicine_id: Number(medicine_id),
            quantity: parseInt(quantity),
            prescription_id: prescription_id ? Number(prescription_id) : null,
            dispensed_date: new Date(),
            dispensed_by: req.user.id // Staff member who dispensed
          },
          include: {
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true,
                email: true
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
            staff: {
              select: {
                staff_id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        });

        // Update medicine stock
        await tx.medicine.update({
          where: { medicine_id: Number(medicine_id) },
          data: { 
            stock_quantity: medicine.stock_quantity - quantity
          }
        });

        return pharmacyRecord;
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
        sortBy = 'dispensed_date', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(medicine_id ? { medicine_id: Number(medicine_id) } : {}),
        ...(dispensed_by ? { dispensed_by: Number(dispensed_by) } : {}),
        ...(date_from || date_to ? {
          dispensed_date: {
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
                contact_number: true
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
            staff: {
              select: {
                staff_id: true,
                first_name: true,
                last_name: true
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
