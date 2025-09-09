const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class CleaningServiceController {
  // Create cleaning service record
  async createCleaningService(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const cleaningData = {
        room_id: Number(req.body.room_id),
        cleaned_by: req.user.id, // Staff member who performed cleaning
        cleaning_date: req.body.cleaning_date ? new Date(req.body.cleaning_date) : new Date(),
        cleaning_type: req.body.cleaning_type,
        notes: req.body.notes || null,
        status: req.body.status || 'Completed'
      };

      const data = await prisma.cleaning_service.create({
        data: cleaningData,
        include: {
          room: {
            select: {
              room_id: true,
              room_number: true,
              room_type: {
                select: {
                  room_type_name: true
                }
              }
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true,
              role: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data,
        message: 'Cleaning service record created successfully'
      });
    } catch (error) {
      console.error('Create cleaning service error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all cleaning service records
  async getAllCleaningServices(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        room_id,
        cleaned_by,
        cleaning_type,
        date_from,
        date_to,
        sortBy = 'cleaning_date', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(room_id ? { room_id: Number(room_id) } : {}),
        ...(cleaned_by ? { cleaned_by: Number(cleaned_by) } : {}),
        ...(cleaning_type ? { cleaning_type } : {}),
        ...(date_from || date_to ? {
          cleaning_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const [data, count] = await Promise.all([
        prisma.cleaning_service.findMany({
          where,
          include: {
            room: {
              select: {
                room_id: true,
                room_number: true,
                room_type: {
                  select: {
                    room_type_name: true
                  }
                }
              }
            },
            staff: {
              select: {
                staff_id: true,
                first_name: true,
                last_name: true,
                role: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.cleaning_service.count({ where })
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
      console.error('Get all cleaning services error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get cleaning service by ID
  async getCleaningServiceById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.cleaning_service.findUnique({
        where: { cleaning_id: Number(id) },
        include: {
          room: {
            select: {
              room_id: true,
              room_number: true,
              status: true,
              room_type: {
                select: {
                  room_type_id: true,
                  room_type_name: true,
                  description: true
                }
              }
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true,
              role: true,
              position: true,
              email: true,
              contact_number: true
            }
          }
        }
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: 'Cleaning service record not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get cleaning service by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update cleaning service record
  async updateCleaningService(req, res) {
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

      const data = await prisma.cleaning_service.update({
        where: { cleaning_id: Number(id) },
        data: {
          room_id: updateData.room_id ? Number(updateData.room_id) : undefined,
          cleaned_by: updateData.cleaned_by ? Number(updateData.cleaned_by) : undefined,
          cleaning_date: updateData.cleaning_date ? new Date(updateData.cleaning_date) : undefined,
          cleaning_type: updateData.cleaning_type,
          notes: updateData.notes,
          status: updateData.status
        },
        include: {
          room: {
            select: {
              room_id: true,
              room_number: true,
              room_type: {
                select: {
                  room_type_name: true
                }
              }
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true,
              role: true
            }
          }
        }
      });

      res.json({
        success: true,
        data,
        message: 'Cleaning service record updated successfully'
      });
    } catch (error) {
      console.error('Update cleaning service error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete cleaning service record
  async deleteCleaningService(req, res) {
    try {
      const { id } = req.params;

      await prisma.cleaning_service.delete({
        where: { cleaning_id: Number(id) }
      });

      res.json({
        success: true,
        message: 'Cleaning service record deleted successfully'
      });
    } catch (error) {
      console.error('Delete cleaning service error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get room cleaning history
  async getRoomCleaningHistory(req, res) {
    try {
      const { room_id } = req.params;

      const data = await prisma.cleaning_service.findMany({
        where: { room_id: Number(room_id) },
        include: {
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true,
              role: true
            }
          }
        },
        orderBy: { cleaning_date: 'desc' }
      });

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get room cleaning history error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get cleaning statistics
  async getCleaningStats(req, res) {
    try {
      const { date_from, date_to } = req.query;

      const where = {
        ...(date_from || date_to ? {
          cleaning_date: {
            ...(date_from ? { gte: new Date(date_from) } : {}),
            ...(date_to ? { lte: new Date(date_to) } : {})
          }
        } : {})
      };

      const data = await prisma.cleaning_service.findMany({
        where,
        select: { cleaning_type: true, room_id: true, cleaned_by: true }
      });

      const stats = data.reduce((acc, record) => {
        acc.total++;
        acc.byType[record.cleaning_type] = (acc.byType[record.cleaning_type] || 0) + 1;
        acc.byRoom[record.room_id] = (acc.byRoom[record.room_id] || 0) + 1;
        acc.byStaff[record.cleaned_by] = (acc.byStaff[record.cleaned_by] || 0) + 1;
        return acc;
      }, {
        total: 0,
        byType: {},
        byRoom: {},
        byStaff: {}
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get cleaning stats error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get daily cleaning report
  async getDailyCleaningReport(req, res) {
    try {
      const { date = new Date().toISOString().split('T')[0] } = req.query;

      const data = await prisma.cleaning_service.findMany({
        where: { cleaning_date: new Date(date) },
        include: {
          room: {
            select: {
              room_id: true,
              room_number: true,
              room_type: {
                select: {
                  room_type_name: true
                }
              }
            }
          },
          staff: {
            select: {
              staff_id: true,
              first_name: true,
              last_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      const summary = data.reduce((acc, record) => {
        acc.totalCleaned++;
        acc.byType[record.cleaning_type] = (acc.byType[record.cleaning_type] || 0) + 1;
        return acc;
      }, {
        totalCleaned: 0,
        byType: {}
      });

      res.json({
        success: true,
        data: {
          date,
          summary,
          records: data
        }
      });
    } catch (error) {
      console.error('Get daily cleaning report error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new CleaningServiceController();
