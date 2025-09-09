const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class AmbulanceController {
  // Create ambulance
  async createAmbulance(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const ambulanceData = {
        ambulance_number: req.body.ambulance_number,
        availability: req.body.availability || 'Available',
        driver_id: req.body.driver_id ?? null,
        last_service_date: req.body.last_service_date ? new Date(req.body.last_service_date) : null
      };

      // Check if ambulance number already exists
      const existingAmbulance = await prisma.ambulance.findFirst({
        where: { ambulance_number: ambulanceData.ambulance_number }
      });

      if (existingAmbulance) {
        return res.status(409).json({
          success: false,
          error: 'Ambulance number already exists'
        });
      }

      const data = await prisma.ambulance.create({ data: ambulanceData });

      res.status(201).json({
        success: true,
        data,
        message: 'Ambulance created successfully'
      });
    } catch (error) {
      console.error('Create ambulance error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all ambulances
  async getAllAmbulances(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        availability,
        search,
        sortBy = 'ambulance_number',
        sortOrder = 'asc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(availability ? { availability } : {}),
        ...(search ? { ambulance_number: { contains: String(search), mode: 'insensitive' } } : {})
      };
      const [data, count] = await Promise.all([
        prisma.ambulance.findMany({
          where,
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.ambulance.count({ where })
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
      console.error('Get all ambulances error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get ambulance by ID
  async getAmbulanceById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.ambulance.findUnique({
        where: { ambulance_id: Number(id) },
        include: {
          ambulance_log: {
            select: {
              log_id: true,
              patient_id: true,
              pickup_location: true,
              dropoff_location: true,
              status: true,
              pickup_time: true,
              patient: { select: { first_name: true, last_name: true } }
            }
          }
        }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Ambulance not found' });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get ambulance by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update ambulance
  async updateAmbulance(req, res) {
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
        ambulance_number: req.body.ambulance_number,
        availability: req.body.availability,
        driver_id: req.body.driver_id ?? null,
        last_service_date: req.body.last_service_date ? new Date(req.body.last_service_date) : undefined
      };

      // Check if ambulance number already exists for other ambulances
      if (updateData.ambulance_number) {
        const existingAmbulance = await prisma.ambulance.findFirst({
          where: { ambulance_number: updateData.ambulance_number, NOT: { ambulance_id: Number(id) } }
        });
        if (existingAmbulance) {
          return res.status(409).json({ success: false, error: 'Ambulance number already exists' });
        }
      }

      const data = await prisma.ambulance.update({ where: { ambulance_id: Number(id) }, data: updateData });

      res.json({
        success: true,
        data,
        message: 'Ambulance updated successfully'
      });
    } catch (error) {
      console.error('Update ambulance error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete ambulance (soft delete)
  async deleteAmbulance(req, res) {
    try {
      const { id } = req.params;

      // Check if ambulance has active logs
      const activeCount = await prisma.ambulance_log.count({ where: { ambulance_id: Number(id), status: 'In Progress' } });

      if (activeCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete ambulance with active logs'
        });
      }

      await prisma.ambulance.delete({ where: { ambulance_id: Number(id) } });

      res.json({ success: true, message: 'Ambulance deleted successfully' });
    } catch (error) {
      console.error('Delete ambulance error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get available ambulances
  async getAvailableAmbulances(req, res) {
    try {
      const data = await prisma.ambulance.findMany({
        where: { availability: 'Available' },
        orderBy: { ambulance_number: 'asc' }
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get available ambulances error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get ambulance statistics
  async getAmbulanceStats(req, res) {
    try {
      const allAmbulances = await prisma.ambulance.findMany({ select: { availability: true } });

      const stats = allAmbulances.reduce((acc, ambulance) => {
        acc.total++;
        acc.byAvailability[ambulance.availability] = (acc.byAvailability[ambulance.availability] || 0) + 1;
        return acc;
      }, {
        total: 0,
        byAvailability: {}
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get ambulance stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

class AmbulanceLogController {
  // Create ambulance log
  async createAmbulanceLog(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const logData = {
        ambulance_id: Number(req.body.ambulance_id),
        patient_id: req.body.patient_id ? Number(req.body.patient_id) : null,
        pickup_location: req.body.pickup_location,
        dropoff_location: req.body.dropoff_location,
        status: req.body.status || 'In Progress',
        pickup_time: req.body.pickup_time ? new Date(req.body.pickup_time) : new Date()
      };

      // Check if ambulance is available
      const ambulance = await prisma.ambulance.findUnique({
        where: { ambulance_id: Number(logData.ambulance_id) },
        select: { ambulance_id: true, availability: true, ambulance_number: true }
      });

      if (!ambulance) {
        return res.status(404).json({
          success: false,
          error: 'Ambulance not found'
        });
      }

      if (ambulance.availability !== 'Available') {
        return res.status(400).json({
          success: false,
          error: 'Ambulance is not available'
        });
      }

      const data = await prisma.ambulance_log.create({ data: logData });

      // Update ambulance availability
      await prisma.ambulance.update({ where: { ambulance_id: Number(logData.ambulance_id) }, data: { availability: 'On Duty' } });

      res.status(201).json({
        success: true,
        data,
        message: 'Ambulance log created successfully'
      });
    } catch (error) {
      console.error('Create ambulance log error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all ambulance logs
  async getAllAmbulanceLogs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        ambulance_id,
        patient_id,
        status,
        date_from,
        date_to,
        sortBy = 'dispatch_time',
        sortOrder = 'desc'
      } = req.query;

      const offset = (page - 1) * limit;

      const where = {
        ...(ambulance_id ? { ambulance_id: Number(ambulance_id) } : {}),
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(status ? { status } : {}),
        ...(date_from || date_to
          ? {
              pickup_time: {
                ...(date_from ? { gte: new Date(date_from) } : {}),
                ...(date_to ? { lte: new Date(date_to) } : {})
              }
            }
          : {})
      };

      const [data, count] = await Promise.all([
        prisma.ambulance_log.findMany({
          where,
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.ambulance_log.count({ where })
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
      console.error('Get all ambulance logs error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get ambulance log by ID
  async getAmbulanceLogById(req, res) {
    try {
      const { id } = req.params;
      const data = await prisma.ambulance_log.findUnique({
        where: { log_id: Number(id) },
        include: { ambulance: true, patient: true }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Ambulance log not found' });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get ambulance log by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update ambulance log
  async updateAmbulanceLog(req, res) {
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
        ambulance_id: req.body.ambulance_id ? Number(req.body.ambulance_id) : undefined,
        patient_id: req.body.patient_id ? Number(req.body.patient_id) : undefined,
        pickup_location: req.body.pickup_location,
        dropoff_location: req.body.dropoff_location,
        status: req.body.status,
        pickup_time: req.body.pickup_time ? new Date(req.body.pickup_time) : undefined,
        dropoff_time: req.body.dropoff_time ? new Date(req.body.dropoff_time) : undefined
      };

      const data = await prisma.ambulance_log.update({ where: { log_id: Number(id) }, data: updateData });

      // If status is Completed, make ambulance available again
      if (updateData.status === 'Completed') {
        await prisma.ambulance.update({
          where: { ambulance_id: Number(data.ambulance_id) },
          data: { availability: 'Available' }
        });
      }

      res.json({ success: true, data, message: 'Ambulance log updated successfully' });
    } catch (error) {
      console.error('Update ambulance log error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get ambulance log statistics
  async getAmbulanceLogStats(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const data = await prisma.ambulance_log.findMany({
        where: {
          ...(date_from || date_to
            ? {
                pickup_time: {
                  ...(date_from ? { gte: new Date(date_from) } : {}),
                  ...(date_to ? { lte: new Date(date_to) } : {})
                }
              }
            : {})
        },
        select: { status: true, ambulance_id: true, pickup_time: true, dropoff_time: true }
      });

      const stats = data.reduce((acc, log) => {
        acc.total++;
        acc.byStatus[log.status] = (acc.byStatus[log.status] || 0) + 1;
        acc.byAmbulance[log.ambulance_id] = (acc.byAmbulance[log.ambulance_id] || 0) + 1;

        // Calculate response time if both times are available
        if (log.pickup_time && log.dropoff_time) {
          const responseTime = new Date(log.dropoff_time) - new Date(log.pickup_time);
          acc.totalResponseTime += responseTime;
          acc.responseTimeCount++;
        }

        return acc;
      }, {
        total: 0,
        byStatus: {},
        byAmbulance: {},
        totalResponseTime: 0,
        responseTimeCount: 0
      });

      // Calculate average response time in minutes
      if (stats.responseTimeCount > 0) {
        stats.averageResponseTime = Math.round(stats.totalResponseTime / stats.responseTimeCount / 60000); // Convert to minutes
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get ambulance log stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = {
  AmbulanceController: new AmbulanceController(),
  AmbulanceLogController: new AmbulanceLogController()
};
