const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class DoctorController {
  // Create doctor
  async createDoctor(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const doctorData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        specialty: req.body.specialty,
        contact_number: req.body.contact_number ?? null,
        email: req.body.email ?? null,
        available_schedule: req.body.available_schedule ?? null
      };

      // Check if email already exists
      if (doctorData.email) {
        const existingDoctor = await prisma.doctors.findFirst({ where: { email: doctorData.email } });
        if (existingDoctor) {
          return res.status(409).json({ success: false, error: 'Doctor with this email already exists' });
        }
      }

      const data = await prisma.doctors.create({ data: doctorData });

      res.status(201).json({
        success: true,
        data,
        message: 'Doctor created successfully'
      });
    } catch (error) {
      console.error('Create doctor error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        specialty,
        department_id,
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(search ? { OR: [
          { first_name: { contains: String(search), mode: 'insensitive' } },
          { last_name: { contains: String(search), mode: 'insensitive' } },
          { specialty: { contains: String(search), mode: 'insensitive' } }
        ] } : {}),
        ...(specialty ? { specialty: { contains: String(specialty), mode: 'insensitive' } } : {}),
        ...(department_id ? { doctor_department: { some: { department_id: Number(department_id) } } } : {})
      };

      const [data, count] = await Promise.all([
        prisma.doctors.findMany({
          where,
          include: { doctor_department: { include: { departments: true } } },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.doctors.count({ where })
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
      console.error('Get all doctors error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get doctor by ID
  async getDoctorById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.doctors.findUnique({
        where: { doctor_id: Number(id) },
        include: { doctor_department: { include: { departments: true } } }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Doctor not found' });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get doctor by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update doctor
  async updateDoctor(req, res) {
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
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        specialty: req.body.specialty,
        contact_number: req.body.contact_number,
        email: req.body.email,
        available_schedule: req.body.available_schedule
      };

      // Check if email already exists for other doctors
      if (updateData.email) {
        const existingDoctor = await prisma.doctors.findFirst({
          where: { email: updateData.email, NOT: { doctor_id: Number(id) } }
        });
        if (existingDoctor) {
          return res.status(409).json({
            success: false,
            error: 'Doctor with this email already exists'
          });
        }
      }
      const data = await prisma.doctors.update({ where: { doctor_id: Number(id) }, data: updateData });

      res.json({
        success: true,
        data,
        message: 'Doctor updated successfully'
      });
    } catch (error) {
      console.error('Update doctor error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete doctor (soft delete)
  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;

      await prisma.doctors.delete({ where: { doctor_id: Number(id) } });
      res.json({ success: true, message: 'Doctor deleted successfully' });
    } catch (error) {
      console.error('Delete doctor error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get doctors by specialty
  async getDoctorsBySpecialty(req, res) {
    try {
      const { specialty } = req.params;

      const data = await prisma.doctors.findMany({
        where: { specialty: { contains: String(specialty), mode: 'insensitive' } },
        include: { doctor_department: { include: { departments: true } } },
        orderBy: { first_name: 'asc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get doctors by specialty error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get doctor by user ID
  async getDoctorByUserId(req, res) {
    try {
      const { userId } = req.params;

      const data = await prisma.doctors.findFirst({
        where: { user_id: userId },
        include: { doctor_department: { include: { departments: true } } }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Doctor not found for this user' });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get doctor by user ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get doctor statistics
  async getDoctorStats(req, res) {
    try {
      const [total, specialties] = await Promise.all([
        prisma.doctors.count(),
        prisma.doctors.findMany({ select: { specialty: true } })
      ]);
      const specialtyCount = specialties.reduce((acc, d) => {
        const key = d.specialty || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      res.json({ success: true, data: { total, specialties: specialtyCount, uniqueSpecialties: Object.keys(specialtyCount).length } });
    } catch (error) {
      console.error('Get doctor stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DoctorController();
