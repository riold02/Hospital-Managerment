const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class PatientController {
  // Create patient
  async createPatient(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const patientData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: new Date(req.body.date_of_birth),
        gender: req.body.gender,
        contact_number: req.body.contact_number ?? null,
        address: req.body.address ?? null,
        email: req.body.email ?? null,
        medical_history: req.body.medical_history ?? null
      };

      // Check if email already exists
      let existingPatient = null;
      if (patientData.email) {
        existingPatient = await prisma.patients.findFirst({ where: { email: patientData.email } });
      }

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          error: 'Patient with this email already exists'
        });
      }

      const data = await prisma.patients.create({ data: patientData });

      res.status(201).json({
        success: true,
        data,
        message: 'Patient created successfully'
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all patients with pagination and search
  async getAllPatients(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search, 
        gender, 
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(search ? { OR: [
          { first_name: { contains: String(search), mode: 'insensitive' } },
          { last_name: { contains: String(search), mode: 'insensitive' } },
          { email: { contains: String(search), mode: 'insensitive' } }
        ] } : {}),
        ...(gender ? { gender } : {})
      };
      const [data, count] = await Promise.all([
        prisma.patients.findMany({
          where,
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.patients.count({ where })
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
      console.error('Get all patients error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get patient by ID
  async getPatientById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.patients.findUnique({ where: { patient_id: Number(id) } });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get patient by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update patient
  async updatePatient(req, res) {
    try {
      // Check validation errors
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
        date_of_birth: req.body.date_of_birth ? new Date(req.body.date_of_birth) : undefined,
        gender: req.body.gender,
        contact_number: req.body.contact_number,
        address: req.body.address,
        email: req.body.email,
        medical_history: req.body.medical_history
      };

      // Check if email already exists for other patients
      if (updateData.email) {
        const existingPatient = await prisma.patients.findFirst({
          where: { email: updateData.email, NOT: { patient_id: Number(id) } }
        });
        if (existingPatient) {
          return res.status(409).json({
            success: false,
            error: 'Patient with this email already exists'
          });
        }
      }

      const data = await prisma.patients.update({ where: { patient_id: Number(id) }, data: updateData });

      res.json({
        success: true,
        data,
        message: 'Patient updated successfully'
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete patient (soft delete)
  async deletePatient(req, res) {
    try {
      const { id } = req.params;

      await prisma.patients.delete({ where: { patient_id: Number(id) } });
      res.json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
      console.error('Delete patient error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get patient statistics
  async getPatientStats(req, res) {
    try {
      const [total, male, female] = await Promise.all([
        prisma.patients.count(),
        prisma.patients.count({ where: { gender: 'M' } }),
        prisma.patients.count({ where: { gender: 'F' } })
      ]);

      res.json({ success: true, data: { total, male, female, other: total - male - female } });
    } catch (error) {
      console.error('Get patient stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PatientController();
