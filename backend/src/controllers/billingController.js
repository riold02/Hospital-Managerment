const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class BillingController {
  // Create billing record
  async createBilling(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const billingData = {
        patient_id: Number(req.body.patient_id),
        appointment_id: req.body.appointment_id ? Number(req.body.appointment_id) : null,
        processed_by_user_id: req.user?.user_id || null,
        total_amount: parseFloat(req.body.total_amount),
        payment_status: req.body.payment_status || 'Pending',
        payment_date: req.body.payment_date ? new Date(req.body.payment_date) : null,
        insurance_provider: req.body.insurance_provider || null
      };

      const data = await prisma.billing.create({
        data: billingData,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              contact_number: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data,
        message: 'Billing record created successfully'
      });
    } catch (error) {
      console.error('Create billing error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all billing records
  async getAllBilling(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        patient_id,
        payment_status,
        date_from,
        date_to,
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      let where = {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(payment_status ? { payment_status } : {}),
        ...(date_from || date_to ? {
          created_at: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      // If user is a patient, filter by their patient_id
      if (req.user && req.user.role === 'patient' && req.user.patient_id) {
        where.patient_id = req.user.patient_id;
      }

      const [data, count] = await Promise.all([
        prisma.billing.findMany({
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
            }
          },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }).catch(error => {
          console.error('Billing query error:', error);
          return [];
        }),
        prisma.billing.count({ where }).catch(error => {
          console.error('Billing count error:', error);
          return 0;
        })
      ]);

      res.json({
        success: true,
        data: Array.isArray(data) ? data : [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
          hasNext: offset + parseInt(limit) < (count || 0),
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get all billing error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get billing by ID
  async getBillingById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.billing.findUnique({
        where: { billing_id: Number(id) },
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
          }
        }
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Billing record not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get billing by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update billing record
  async updateBilling(req, res) {
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
        patient_id: req.body.patient_id ? Number(req.body.patient_id) : undefined,
        appointment_id: req.body.appointment_id ? Number(req.body.appointment_id) : undefined,
        processed_by_user_id: req.body.processed_by_user_id || undefined,
        total_amount: req.body.total_amount ? parseFloat(req.body.total_amount) : undefined,
        payment_status: req.body.payment_status,
        payment_date: req.body.payment_date ? new Date(req.body.payment_date) : undefined,
        insurance_provider: req.body.insurance_provider
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      // If payment status is being updated to Paid, set payment date
      if (updateData.payment_status === 'Paid' && !updateData.payment_date) {
        updateData.payment_date = new Date();
      }

      const data = await prisma.billing.update({
        where: { billing_id: Number(id) },
        data: updateData,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              contact_number: true
            }
          }
        }
      });

      res.json({
        success: true,
        data,
        message: 'Billing record updated successfully'
      });
    } catch (error) {
      console.error('Update billing error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete billing record (hard delete)
  async deleteBilling(req, res) {
    try {
      const { id } = req.params;

      await prisma.billing.delete({
        where: { billing_id: Number(id) }
      });

      res.json({
        success: true,
        message: 'Billing record deleted successfully'
      });
    } catch (error) {
      console.error('Delete billing error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get billing statistics
  async getBillingStats(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const where = {
        ...(date_from || date_to ? {
          created_at: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const data = await prisma.billing.findMany({
        where,
        select: { total_amount: true, payment_status: true }
      });

      const stats = data.reduce((acc, bill) => {
        acc.totalRevenue += parseFloat(bill.total_amount || 0);
        
        if (bill.payment_status === 'Paid') {
          acc.paidAmount += parseFloat(bill.total_amount || 0);
          acc.paidCount++;
        } else if (bill.payment_status === 'Pending') {
          acc.pendingAmount += parseFloat(bill.total_amount || 0);
          acc.pendingCount++;
        } else if (bill.payment_status === 'Overdue') {
          acc.overdueAmount += parseFloat(bill.total_amount || 0);
          acc.overdueCount++;
        }
        
        acc.totalCount++;
        return acc;
      }, {
        totalRevenue: 0,
        paidAmount: 0,
        pendingAmount: 0,
        overdueAmount: 0,
        totalCount: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get billing stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get patient billing history
  async getPatientBillingHistory(req, res) {
    try {
      const { patient_id } = req.params;

      const data = await prisma.billing.findMany({
        where: { patient_id: Number(patient_id) },
        orderBy: { created_at: 'desc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get patient billing history error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new BillingController();
