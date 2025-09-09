const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class RoomTypeController {
  // Create room type
  async createRoomType(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const roomTypeData = {
        room_type_name: req.body.room_type_name,
        description: req.body.description
      };

      const data = await prisma.room_types.create({ data: roomTypeData });

      res.status(201).json({
        success: true,
        data,
        message: 'Room type created successfully'
      });
    } catch (error) {
      console.error('Create room type error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all room types
  async getAllRoomTypes(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        sortBy = 'room_type_name',
        sortOrder = 'asc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = search
        ? { OR: [
            { room_type_name: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } }
          ] }
        : {};
      const [data, count] = await Promise.all([
        prisma.room_types.findMany({
          where,
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.room_types.count({ where })
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
      console.error('Get all room types error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get room type by ID
  async getRoomTypeById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.room_types.findUnique({
        where: { room_type_id: Number(id) },
        include: { rooms: { select: { room_id: true, room_number: true, status: true } } }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Room type not found' });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get room type by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update room type
  async updateRoomType(req, res) {
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

      const data = await prisma.room_types.update({ where: { room_type_id: Number(id) }, data: updateData });

      res.json({
        success: true,
        data,
        message: 'Room type updated successfully'
      });
    } catch (error) {
      console.error('Update room type error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete room type (soft delete)
  async deleteRoomType(req, res) {
    try {
      const { id } = req.params;

      // Check if room type has rooms
      const roomsCount = await prisma.rooms.count({ where: { room_type_id: Number(id) } });

      if (roomsCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete room type with active rooms'
        });
      }

      await prisma.room_types.delete({ where: { room_type_id: Number(id) } });

      res.json({ success: true, message: 'Room type deleted successfully' });
    } catch (error) {
      console.error('Delete room type error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new RoomTypeController();
