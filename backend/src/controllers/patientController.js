const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

      const { 
        first_name, last_name, date_of_birth, gender, phone, 
        address, email, password, blood_type,
        emergency_contact_name, emergency_contact_phone, medical_history 
      } = req.body;

      // Check if email already exists
      if (email) {
        const existingUser = await prisma.users.findFirst({ where: { email } });
        if (existingUser) {
          return res.status(409).json({ success: false, error: 'Email already exists' });
        }
      }

      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Create user account first if email and password provided
      let userId = null;
      if (email && hashedPassword) {
        // Find patient role_id
        const patientRole = await prisma.roles.findUnique({
          where: { role_name: 'patient' }
        });
        
        if (!patientRole) {
          return res.status(500).json({ success: false, error: 'Patient role not found in system' });
        }

        // Create user
        const user = await prisma.users.create({
          data: {
            email,
            password_hash: hashedPassword,
            is_active: true
          }
        });
        userId = user.user_id;

        // Assign patient role to user
        await prisma.user_roles.create({
          data: {
            user_id: userId,
            role_id: patientRole.role_id,
            is_active: true
          }
        });
      }

      // Generate patient code
      const lastPatient = await prisma.patients.findFirst({
        orderBy: { patient_id: 'desc' }
      });
      const nextId = lastPatient ? lastPatient.patient_id + 1 : 1;
      const patient_code = `P${String(nextId).padStart(6, '0')}`;

      const patientData = {
        user_id: userId,
        patient_code,
        first_name,
        last_name,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        gender: gender ?? null,
        phone: phone ?? null,
        address: address ?? null,
        email: email ?? null,
        blood_type: blood_type ?? null,
        emergency_contact_name: emergency_contact_name ?? null,
        emergency_contact_phone: emergency_contact_phone ?? null,
        medical_history: medical_history ?? null
      };

      const data = await prisma.patients.create({ data: patientData });

      res.status(201).json({
        success: true,
        data,
        message: 'Patient and user account created successfully'
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
      
      // Map gender from M/F/O to male/female/other for database
      const genderMapping = { 'M': 'male', 'F': 'female', 'O': 'other' };
      const mappedGender = req.body.gender ? genderMapping[req.body.gender] : undefined;
      
      const updateData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth ? new Date(req.body.date_of_birth) : undefined,
        gender: mappedGender,
        phone: req.body.phone,
        address: req.body.address,
        email: req.body.email,
        medical_history: req.body.medical_history,
        emergency_contact_name: req.body.emergency_contact_name,
        emergency_contact_phone: req.body.emergency_contact_phone,
        blood_type: req.body.blood_type,
        allergies: req.body.allergies,
        insurance_number: req.body.insurance_number
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

  // Delete patient (hard delete)
  async deletePatient(req, res) {
    try {
      const { id } = req.params;

      // Use transaction to ensure all operations succeed or fail together
      const result = await prisma.$transaction(async (tx) => {
        // First, get the patient to find the associated user_id
        const patient = await tx.patients.findUnique({
          where: { patient_id: Number(id) },
          select: { user_id: true }
        });

        if (!patient) {
          throw new Error('Patient not found');
        }

        console.log('Deleting patient with user_id:', patient.user_id);

        // Delete patient record (this will cascade to related records)
        await tx.patients.delete({ 
          where: { patient_id: Number(id) } 
        });
        console.log('Patient record deleted');

        // Delete user roles
        if (patient.user_id) {
          await tx.user_roles.deleteMany({
            where: { user_id: patient.user_id }
          });
          console.log('User roles deleted');

          // Delete user account
          await tx.users.delete({
            where: { user_id: patient.user_id }
          });
          console.log('User account deleted');
        }

        return { success: true, message: 'Patient and user account deleted successfully' };
      });

      res.json(result);
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
