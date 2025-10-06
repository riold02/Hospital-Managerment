const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class MedicalRecordController {
  // Get technician dashboard overview
  async getTechnicianDashboard(req, res) {
    try {
      const [
        pendingTests,
        completedToday,
        equipmentStatus,
        criticalResults,
        recentTests
      ] = await Promise.all([
        // Pending lab tests
        prisma.medical_records.count({
          where: {
            record_type: 'Lab Test Requested',
            diagnosis: {
              not: {
                contains: 'completed'
              }
            }
          }
        }),
        
        // Tests completed today
        prisma.medical_records.count({
          where: {
            record_type: 'Lab Result',
            created_at: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }),
        
        // Mock equipment status - in real system this would come from equipment management
        Promise.resolve([
          { name: 'CBC Analyzer', status: 'operational', last_maintenance: '2024-09-20' },
          { name: 'Chemistry Analyzer', status: 'maintenance', last_maintenance: '2024-09-18' },
          { name: 'Microscope Unit A', status: 'operational', last_maintenance: '2024-09-22' }
        ]),
        
        // Critical results requiring attention
        prisma.medical_records.count({
          where: {
            record_type: 'Lab Result',
            diagnosis: {
              contains: 'critical'
            },
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Recent test activities
        prisma.medical_records.findMany({
          take: 10,
          orderBy: { created_at: 'desc' },
          where: {
            record_type: {
              in: ['Lab Test Requested', 'Lab Result']
            }
          },
          include: {
            patient: {
              select: {
                first_name: true,
                last_name: true,
                patient_id: true
              }
            }
          }
        })
      ]);

      const dashboardData = {
        overview: {
          pendingTests,
          completedToday,
          equipmentOperational: equipmentStatus.filter(e => e.status === 'operational').length,
          totalEquipment: equipmentStatus.length,
          criticalResults
        },
        equipmentStatus,
        recentTests
      };

      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      console.error('Error fetching technician dashboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch technician dashboard data'
      });
    }
  }

  // Record test result
  async recordTestResult(req, res) {
    try {
      const { testId } = req.params;
      const { 
        results, 
        reference_ranges, 
        interpretation, 
        technician_notes,
        critical_flag 
      } = req.body;

      // Find the test request
      const testRequest = await prisma.medical_records.findUnique({
        where: { record_id: parseInt(testId) }
      });

      if (!testRequest) {
        return res.status(404).json({
          success: false,
          error: 'Test request not found'
        });
      }

      // Create lab result record
      const labResult = await prisma.medical_records.create({
        data: {
          patient_id: testRequest.patient_id,
          doctor_id: testRequest.doctor_id,
          record_type: 'Lab Result',
          diagnosis: `${critical_flag ? 'CRITICAL - ' : ''}${interpretation}`,
          treatment: `Results: ${JSON.stringify(results)} | Ranges: ${reference_ranges}`,
          symptoms: testRequest.symptoms,
          notes: `Original Test: ${testRequest.record_id} | Tech Notes: ${technician_notes || ''}`
        },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              patient_id: true
            }
          }
        }
      });

      // Update original test request as completed
      await prisma.medical_records.update({
        where: { record_id: parseInt(testId) },
        data: {
          diagnosis: `${testRequest.diagnosis} - completed`,
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        data: labResult,
        message: 'Test result recorded successfully'
      });
    } catch (error) {
      console.error('Error recording test result:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to record test result'
      });
    }
  }
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
        // visit_date is not in schema, using created_at instead
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
        sortBy = 'created_at', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(doctor_id ? { doctor_id: Number(doctor_id) } : {}),
        ...(date_from || date_to ? {
          created_at: {
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
        // visit_date is not in schema, removed
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
