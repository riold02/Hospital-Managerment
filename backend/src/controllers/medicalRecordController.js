const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class MedicalRecordController {
  // Create medical record
  async createMedicalRecord(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const medicalRecordData = {
                                                                                                                                             patient_id: Number(req.body.patient_id),
        doctor_id: Number(req.body.doctor_id),
        visit_date: req.body.visit_date ? new Date(req.body.visit_date) : new Date(),
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment || null,
        symptoms: req.body.symptoms || null,
        notes: req.body.notes || null
      };

      const data = await prisma.medical_records.create({
        data: medicalRecordData,
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
        message: 'Medical record created successfully'
      });
    } catch (error) {
      console.error('Create medical record error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all medical records
  async getAllMedicalRecords(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        patient_id,
        doctor_id,
        date_from,
        date_to,
        diagnosis,
        sortBy = 'visit_date', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(doctor_id ? { doctor_id: Number(doctor_id) } : {}),
        ...(date_from || date_to ? {
          visit_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {}),
        ...(diagnosis ? { diagnosis: { contains: diagnosis, mode: 'insensitive' } } : {})
      };

      const [data, count] = await Promise.all([
        prisma.medical_records.findMany({
          where,
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
          },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.medical_records.count({ where })
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
      console.error('Get all medical records error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get medical record by ID
  async getMedicalRecordById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.medical_records.findUnique({
        where: { record_id: Number(id) },
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              date_of_birth: true,
              gender: true,
              contact_number: true,
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
          error: 'Medical record not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get medical record by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update medical record
  async updateMedicalRecord(req, res) {
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
        doctor_id: req.body.doctor_id ? Number(req.body.doctor_id) : undefined,
        visit_date: req.body.visit_date ? new Date(req.body.visit_date) : undefined,
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        symptoms: req.body.symptoms,
        notes: req.body.notes
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const data = await prisma.medical_records.update({
        where: { record_id: Number(id) },
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
        message: 'Medical record updated successfully'
      });
    } catch (error) {
      console.error('Update medical record error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete medical record (hard delete)
  async deleteMedicalRecord(req, res) {
    try {
      const { id } = req.params;

      await prisma.medical_records.delete({
        where: { record_id: Number(id) }
      });

      res.json({
        success: true,
        message: 'Medical record deleted successfully'
      });
    } catch (error) {
      console.error('Delete medical record error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Add medicine to medical record
  async addMedicineToRecord(req, res) {
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
      const { medicine_id, dosage, frequency, duration } = req.body;

      // Check if medical record exists
      const medicalRecord = await prisma.medical_records.findUnique({
        where: { record_id: Number(id) },
        select: { record_id: true }
      });

      if (!medicalRecord) {
        return res.status(404).json({
          success: false,
          error: 'Medical record not found'
        });
      }

      // For now, we'll skip the medicine relation as it might not exist in the schema
      // This is a simplified version - you may need to adjust based on your actual schema
      res.status(201).json({
        success: true,
        message: 'Medicine functionality not implemented in current schema'
      });
    } catch (error) {
      console.error('Add medicine to record error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Remove medicine from medical record
  async removeMedicineFromRecord(req, res) {
    try {
      const { id, medicine_id } = req.params;

      // For now, we'll skip the medicine relation as it might not exist in the schema
      // This is a simplified version - you may need to adjust based on your actual schema
      res.json({
        success: true,
        message: 'Medicine functionality not implemented in current schema'
      });
    } catch (error) {
      console.error('Remove medicine from record error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new MedicalRecordController();
