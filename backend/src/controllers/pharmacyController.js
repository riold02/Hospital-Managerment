const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class PharmacyController {
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
