const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class PrescriptionController {
  // Create prescription
  async createPrescription(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const prescriptionData = {
        patient_id: Number(req.body.patient_id),
        prescribed_by: req.user.id, // Doctor who prescribed
        prescription_date: req.body.prescription_date ? new Date(req.body.prescription_date) : new Date(),
        medication: req.body.medication,
        dosage: req.body.dosage || null,
        frequency: req.body.frequency || null,
        duration: req.body.duration || null,
        instructions: req.body.instructions || null,
        status: req.body.status || 'Active'
      };

      const data = await prisma.prescriptions.create({
        data: prescriptionData,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              date_of_birth: true,
              gender: true
            }
          },
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data,
        message: 'Prescription created successfully'
      });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all prescriptions
  async getAllPrescriptions(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        patient_id,
        prescribed_by,
        status,
        date_from,
        date_to,
        sortBy = 'prescription_date', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      let where = {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(prescribed_by ? { prescribed_by: Number(prescribed_by) } : {}),
        ...(status ? { status } : {}),
        ...(date_from || date_to ? {
          prescription_date: {
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
        prisma.prescriptions.findMany({
          where,
          include: {
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true
              }
            },
            doctor: {
              select: {
                doctor_id: true,
                first_name: true,
                last_name: true,
                specialty: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.prescriptions.count({ where })
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
      console.error('Get all prescriptions error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get prescription by ID
  async getPrescriptionById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.prescriptions.findUnique({
        where: { prescription_id: Number(id) },
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              date_of_birth: true,
              gender: true,
              address: true,
              medical_history: true
            }
          },
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true,
              email: true,
              contact_number: true
            }
          }
        }
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get prescription by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update prescription
  async updatePrescription(req, res) {
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
        prescribed_by: req.body.prescribed_by ? Number(req.body.prescribed_by) : undefined,
        prescription_date: req.body.prescription_date ? new Date(req.body.prescription_date) : undefined,
        medication: req.body.medication,
        dosage: req.body.dosage,
        frequency: req.body.frequency,
        duration: req.body.duration,
        instructions: req.body.instructions,
        status: req.body.status
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const data = await prisma.prescriptions.update({
        where: { prescription_id: Number(id) },
        data: updateData,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true
            }
          },
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        }
      });

      res.json({
        success: true,
        data,
        message: 'Prescription updated successfully'
      });
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete prescription
  async deletePrescription(req, res) {
    try {
      const { id } = req.params;

      await prisma.prescriptions.delete({
        where: { prescription_id: Number(id) }
      });

      res.json({
        success: true,
        message: 'Prescription deleted successfully'
      });
    } catch (error) {
      console.error('Delete prescription error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get patient's prescriptions
  async getPatientPrescriptions(req, res) {
    try {
      const { patient_id } = req.params;
      const { status } = req.query;

      const where = {
        patient_id: Number(patient_id),
        ...(status ? { status } : {})
      };

      const data = await prisma.prescriptions.findMany({
        where,
        include: {
          doctor: {
            select: {
              doctor_id: true,
              first_name: true,
              last_name: true,
              specialty: true
            }
          }
        },
        orderBy: { prescription_date: 'desc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get patient prescriptions error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get doctor's prescriptions
  async getDoctorPrescriptions(req, res) {
    try {
      const { doctor_id } = req.params;
      const { status, date } = req.query;

      const where = {
        prescribed_by: Number(doctor_id),
        ...(status ? { status } : {}),
        ...(date ? { prescription_date: new Date(date) } : {})
      };

      const data = await prisma.prescriptions.findMany({
        where,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              contact_number: true
            }
          }
        },
        orderBy: { prescription_date: 'desc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get doctor prescriptions error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get prescription statistics
  async getPrescriptionStats(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const where = {
        ...(date_from || date_to ? {
          prescription_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const data = await prisma.prescriptions.findMany({
        where,
        select: { status: true, prescribed_by: true, patient_id: true }
      });

      const stats = data.reduce((acc, prescription) => {
        acc.total++;
        acc.byStatus[prescription.status] = (acc.byStatus[prescription.status] || 0) + 1;
        acc.byDoctor[prescription.prescribed_by] = (acc.byDoctor[prescription.prescribed_by] || 0) + 1;
        return acc;
      }, {
        total: 0,
        byStatus: {},
        byDoctor: {}
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get prescription stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PrescriptionController();
