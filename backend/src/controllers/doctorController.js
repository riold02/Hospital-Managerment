const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

      const { first_name, last_name, specialty, phone, email, password, available_schedule } = req.body;

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
        // Find doctor role_id
        const doctorRole = await prisma.roles.findUnique({
          where: { role_name: 'doctor' }
        });
        
        if (!doctorRole) {
          return res.status(500).json({ success: false, error: 'Doctor role not found in system' });
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

        // Assign doctor role to user
        await prisma.user_roles.create({
          data: {
            user_id: userId,
            role_id: doctorRole.role_id,
            is_active: true
          }
        });
      }

      // Create doctor record
      const doctorData = {
        user_id: userId,
        first_name,
        last_name,
        specialty,
        phone: phone ?? null,
        email: email ?? null,
        available_schedule: available_schedule ?? null
      };

      const data = await prisma.doctors.create({ data: doctorData });

      res.status(201).json({
        success: true,
        data,
        message: 'Doctor and user account created successfully'
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

  // Delete doctor (hard delete)
  async deleteDoctor(req, res) {
    try {
      const { id } = req.params;

      // Use transaction to ensure all operations succeed or fail together
      const result = await prisma.$transaction(async (tx) => {
        // First, get the doctor to find the associated user_id
        const doctor = await tx.doctors.findUnique({
          where: { doctor_id: Number(id) },
          select: { user_id: true }
        });

        if (!doctor) {
          throw new Error('Doctor not found');
        }

        console.log('Deleting doctor with user_id:', doctor.user_id);

        // Delete related records first to avoid foreign key constraints
        // Delete appointments
        await tx.appointments.deleteMany({
          where: { doctor_id: Number(id) }
        });
        console.log('Appointments deleted');

        // Delete medical records
        await tx.medical_records.deleteMany({
          where: { doctor_id: Number(id) }
        });
        console.log('Medical records deleted');

        // Delete prescriptions
        await tx.prescriptions.deleteMany({
          where: { prescribed_by_user_id: doctor.user_id }
        });
        console.log('Prescriptions deleted');

        // Delete doctor record
        await tx.doctors.delete({ where: { doctor_id: Number(id) } });
        console.log('Doctor record deleted');

        // Delete user roles
        if (doctor.user_id) {
          await tx.user_roles.deleteMany({
            where: { user_id: doctor.user_id }
          });
          console.log('User roles deleted');

          // Delete user account
          await tx.users.delete({
            where: { user_id: doctor.user_id }
          });
          console.log('User account deleted');
        }

        return { success: true, message: 'Doctor and user account deleted successfully' };
      });

      res.json(result);
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
