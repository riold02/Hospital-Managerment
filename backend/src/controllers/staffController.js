const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

class StaffController {
  // Create staff member
  async createStaff(req, res) {
    try {
      // Admin-only guard for creating staff/assigning role
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'ADMIN');
      if (!isAdmin) {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin only' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, ...staffData } = req.body;

      // Check if email already exists
      const existingStaff = await prisma.staff.findFirst({
        where: { email }
      });

      if (existingStaff) {
        return res.status(409).json({
          success: false,
          error: 'Staff with this email already exists'
        });
      }

      const newStaffData = {
        first_name: staffData.first_name,
        last_name: staffData.last_name,
        email,
        role: staffData.role,
        position: staffData.position,
        department_id: staffData.department_id ? Number(staffData.department_id) : null,
        contact_number: staffData.contact_number
      };

      const data = await prisma.staff.create({
        data: newStaffData,
        include: {
          departments: {
            select: {
              department_id: true,
              department_name: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data,
        message: 'Staff member created successfully'
      });
    } catch (error) {
      console.error('Create staff error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all staff members
  async getAllStaff(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        role,
        department_id,
        search,
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(role ? { role } : {}),
        ...(department_id ? { department_id: Number(department_id) } : {}),
        ...(search ? {
          OR: [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } }
          ]
        } : {})
      };

      const [data, count] = await Promise.all([
        prisma.staff.findMany({
          where,
          include: {
            departments: {
              select: {
                department_id: true,
                department_name: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.staff.count({ where })
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
      console.error('Get all staff error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get staff member by ID
  async getStaffById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.staff.findUnique({
        where: { staff_id: Number(id) },
        include: {
          departments: {
            select: {
              department_id: true,
              department_name: true,
              description: true
            }
          }
        }
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Staff member not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get staff by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update staff member
  async updateStaff(req, res) {
    try {
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'ADMIN');
      // Block non-admin from changing role
      if (!isAdmin && Object.prototype.hasOwnProperty.call(req.body, 'role')) {
        return res.status(403).json({ success: false, error: 'Forbidden: Only admin can change role' });
      }

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
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        role: req.body.role,
        position: req.body.position,
        department_id: req.body.department_id ? Number(req.body.department_id) : undefined,
        contact_number: req.body.contact_number
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const data = await prisma.staff.update({
        where: { staff_id: Number(id) },
        data: updateData
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete staff member (hard delete)
  async deleteStaff(req, res) {
    try {
      const { id } = req.params;

      await prisma.staff.delete({
        where: { staff_id: Number(id) }
      });

      res.json({
        success: true,
        message: 'Staff member deleted successfully'
      });
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }


  // Get staff statistics
  async getStaffStats(req, res) {
    try {
      const allStaff = await prisma.staff.findMany({
        select: { role: true, department_id: true }
      });

      const stats = allStaff.reduce((acc, staff) => {
        acc.total++;
        acc.byRole[staff.role] = (acc.byRole[staff.role] || 0) + 1;
        
        if (staff.department_id) {
          acc.byDepartment[staff.department_id] = (acc.byDepartment[staff.department_id] || 0) + 1;
        }
        
        return acc;
      }, {
        total: 0,
        byRole: {},
        byDepartment: {}
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get staff stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new StaffController();
