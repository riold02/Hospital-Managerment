const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class MedicineController {
  // Create medicine
  async createMedicine(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const medicineData = {
        name: req.body.name,
        brand: req.body.brand,
        type: req.body.type,
        dosage: req.body.dosage,
        stock_quantity: req.body.stock_quantity ?? 0,
        expiry_date: req.body.expiry_date ? new Date(req.body.expiry_date) : null
      };

      const data = await prisma.medicine.create({ data: medicineData });

      res.status(201).json({
        success: true,
        data,
        message: 'Medicine created successfully'
      });
    } catch (error) {
      console.error('Create medicine error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all medicines
  async getAllMedicines(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        medicine_type,
        search,
        expiry_date_from,
        expiry_date_to,
        low_stock,
        sortBy = 'name',
        sortOrder = 'asc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(medicine_type ? { type: medicine_type } : {}),
        ...(search ? {
          OR: [
            { name: { contains: String(search), mode: 'insensitive' } },
            { brand: { contains: String(search), mode: 'insensitive' } }
          ]
        } : {}),
        ...(expiry_date_from || expiry_date_to ? {
          expiry_date: {
            ...(expiry_date_from ? { gte: new Date(expiry_date_from) } : {}),
            ...(expiry_date_to ? { lte: new Date(expiry_date_to) } : {})
          }
        } : {}),
        ...(low_stock === 'true' ? { stock_quantity: { lte: 10 } } : {})
      };

      const [data, count] = await Promise.all([
        prisma.medicine.findMany({
          where,
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.medicine.count({ where })
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
      console.error('Get all medicines error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get medicine by ID
  async getMedicineById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.medicine.findUnique({ where: { medicine_id: Number(id) } });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Medicine not found' });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get medicine by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update medicine
  async updateMedicine(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = {
        name: req.body.name,
        brand: req.body.brand,
        type: req.body.type,
        dosage: req.body.dosage,
        stock_quantity: req.body.stock_quantity,
        expiry_date: req.body.expiry_date ? new Date(req.body.expiry_date) : undefined
      };

      const data = await prisma.medicine.update({ where: { medicine_id: Number(id) }, data: updateData });

      res.json({
        success: true,
        data,
        message: 'Medicine updated successfully'
      });
    } catch (error) {
      console.error('Update medicine error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete medicine (soft delete)
  async deleteMedicine(req, res) {
    try {
      const { id } = req.params;

      await prisma.medicine.delete({ where: { medicine_id: Number(id) } });
      res.json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error) {
      console.error('Delete medicine error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get medicines by type
  async getMedicinesByType(req, res) {
    try {
      const { type } = req.params;

      const data = await prisma.medicine.findMany({ where: { type }, orderBy: { name: 'asc' } });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get medicines by type error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get low stock medicines
  async getLowStockMedicines(req, res) {
    try {
      const { threshold = 10 } = req.query;

      const data = await prisma.medicine.findMany({ where: { stock_quantity: { lte: Number(threshold) } }, orderBy: { stock_quantity: 'asc' } });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get low stock medicines error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get expired medicines
  async getExpiredMedicines(req, res) {
    try {
      const today = new Date();
      const data = await prisma.medicine.findMany({ where: { expiry_date: { lt: today } }, orderBy: { expiry_date: 'asc' } });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get expired medicines error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get medicine statistics
  async getMedicineStats(req, res) {
    try {
      const allMedicines = await prisma.medicine.findMany({ select: { type: true, stock_quantity: true, expiry_date: true } });

      const today = new Date().toISOString().split('T')[0];

      const stats = allMedicines.reduce((acc, medicine) => {
        acc.total++;
        acc.totalValue += 0; // unit_price không có trong schema hiện tại
        
        // Count by type
        acc.byType[medicine.type || 'Unknown'] = (acc.byType[medicine.type || 'Unknown'] || 0) + 1;
        
        // Count low stock (<=10)
        if (parseInt(medicine.stock_quantity || 0) <= 10) {
          acc.lowStock++;
        }
        
        // Count expired
        if (medicine.expiry_date && medicine.expiry_date < today.toISOString()) {
          acc.expired++;
        }
        
        // Count expiring soon (within 30 days)
        const expiryDate = new Date(medicine.expiry_date);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        if (medicine.expiry_date && expiryDate <= thirtyDaysFromNow && expiryDate >= new Date()) {
          acc.expiringSoon++;
        }
        
        return acc;
      }, {
        total: 0,
        totalValue: 0,
        byType: {},
        lowStock: 0,
        expired: 0,
        expiringSoon: 0
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get medicine stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new MedicineController();
