const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class DepartmentController {
  // Create department
  async createDepartment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const departmentData = {
        department_name: req.body.department_name,
        location: req.body.location
      };

      const data = await prisma.departments.create({ data: departmentData });

      res.status(201).json({
        success: true,
        data,
        message: 'Department created successfully'
      });
    } catch (error) {
      console.error('Create department error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all departments
  async getAllDepartments(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        sortBy = 'department_name', 
        sortOrder = 'asc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = search
        ? { OR: [
            { department_name: { contains: String(search), mode: 'insensitive' } },
            { location: { contains: String(search), mode: 'insensitive' } }
          ] }
        : {};
      const [data, count] = await Promise.all([
        prisma.departments.findMany({
          where,
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.departments.count({ where })
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
      console.error('Get all departments error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get department by ID
  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.departments.findUnique({
        where: { department_id: Number(id) },
        include: {
          staff: {
            select: { staff_id: true, first_name: true, last_name: true, role: true }
          },
          doctor_department: {
            include: { doctors: { select: { doctor_id: true, first_name: true, last_name: true, specialty: true } } }
          }
        }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Department not found' });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get department by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update department
  async updateDepartment(req, res) {
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
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const data = await prisma.departments.update({ where: { department_id: Number(id) }, data: updateData });

      res.json({
        success: true,
        data,
        message: 'Department updated successfully'
      });
    } catch (error) {
      console.error('Update department error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete department (soft delete)
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;

      // Check if department has related staff or doctors
      const [staffCount, doctorCount] = await Promise.all([
        prisma.staff.count({ where: { department_id: Number(id) } }),
        prisma.doctor_department.count({ where: { department_id: Number(id) } })
      ]);

      if (staffCount > 0 || doctorCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete department with active staff or doctors'
        });
      }

      await prisma.departments.delete({ where: { department_id: Number(id) } });

      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Assign doctor to department
  async assignDoctorToDepartment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { doctor_id, department_id } = req.body;

      // Check if assignment already exists
      const existing = await prisma.doctor_department.findUnique({
        where: { doctor_id_department_id: { doctor_id: Number(doctor_id), department_id: Number(department_id) } }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'Doctor is already assigned to this department'
        });
      }

      const data = await prisma.doctor_department.create({
        data: { doctor_id: Number(doctor_id), department_id: Number(department_id) },
        include: { doctors: true, departments: true }
      });

      res.status(201).json({ success: true, data, message: 'Doctor assigned to department successfully' });
    } catch (error) {
      console.error('Assign doctor to department error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Remove doctor from department
  async removeDoctorFromDepartment(req, res) {
    try {
      const { doctor_id, department_id } = req.body;

      await prisma.doctor_department.delete({
        where: { doctor_id_department_id: { doctor_id: Number(doctor_id), department_id: Number(department_id) } }
      });

      res.json({ success: true, message: 'Doctor removed from department successfully' });
    } catch (error) {
      console.error('Remove doctor from department error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DepartmentController();
