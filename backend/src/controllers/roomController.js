const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class RoomController {
  // Create room
  async createRoom(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const roomData = {
        room_number: req.body.room_number,
        room_type_id: req.body.room_type_id ? Number(req.body.room_type_id) : null,
        capacity: req.body.capacity ?? null,
        status: req.body.status || 'Available',
        last_serviced: req.body.last_serviced ? new Date(req.body.last_serviced) : null
      };

      // Check if room number already exists
      const existingRoom = await prisma.rooms.findFirst({ where: { room_number: roomData.room_number } });
      if (existingRoom) {
        return res.status(409).json({ success: false, error: 'Room number already exists' });
      }

      const data = await prisma.rooms.create({ data: roomData, include: { room_type: true } });

      res.status(201).json({ success: true, data, message: 'Room created successfully' });
    } catch (error) {
      console.error('Create room error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get all rooms
  async getAllRooms(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        room_type_id,
        status,
        search,
        sortBy = 'room_number', 
        sortOrder = 'asc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(room_type_id ? { room_type_id: Number(room_type_id) } : {}),
        ...(status ? { status } : {}),
        ...(search ? { OR: [
          { room_number: { contains: String(search), mode: 'insensitive' } },
        ] } : {})
      };

      const [data, count] = await Promise.all([
        prisma.rooms.findMany({
          where,
          include: { room_type: true },
          orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
          skip: Number(offset),
          take: Number(limit)
        }),
        prisma.rooms.count({ where })
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
      console.error('Get all rooms error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get room by ID
  async getRoomById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.rooms.findUnique({
        where: { room_id: Number(id) },
        include: {
          room_type: true
        }
      });

      if (!data) {
        return res.status(404).json({ success: false, error: 'Room not found' });
      }

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get room by ID error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Update room
  async updateRoom(req, res) {
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
        room_number: req.body.room_number,
        room_type_id: req.body.room_type_id ? Number(req.body.room_type_id) : undefined,
        capacity: req.body.capacity,
        status: req.body.status,
        last_serviced: req.body.last_serviced ? new Date(req.body.last_serviced) : undefined
      };

      // Check if room number already exists for other rooms
      if (updateData.room_number) {
        const existingRoom = await prisma.rooms.findFirst({
          where: { room_number: updateData.room_number, NOT: { room_id: Number(id) } }
        });
        if (existingRoom) {
          return res.status(409).json({ success: false, error: 'Room number already exists' });
        }
      }

      const data = await prisma.rooms.update({ where: { room_id: Number(id) }, data: updateData, include: { room_type: true } });

      res.json({ success: true, data, message: 'Room updated successfully' });
    } catch (error) {
      console.error('Update room error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete room (hard delete when no active assignments)
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;

      // Check if room has active assignments
      const assignmentsCount = await prisma.room_assignments.count({ where: { room_id: Number(id), end_date: null } });

      if (assignmentsCount > 0) {
        return res.status(400).json({ success: false, error: 'Cannot delete room with active assignments' });
      }

      await prisma.rooms.delete({ where: { room_id: Number(id) } });

      res.json({ success: true, message: 'Room deleted successfully' });
    } catch (error) {
      console.error('Delete room error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get available rooms
  async getAvailableRooms(req, res) {
    try {
      const { room_type_id } = req.query;

      const data = await prisma.rooms.findMany({
        where: {
          status: 'Available',
          ...(room_type_id ? { room_type_id: Number(room_type_id) } : {})
        },
        include: { room_type: true },
        orderBy: { room_number: 'asc' }
      });

      res.json({ success: true, data });
    } catch (error) {
      console.error('Get available rooms error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get room statistics
  async getRoomStats(req, res) {
    try {
      const allRooms = await prisma.rooms.findMany({ select: { status: true, room_type_id: true } });

      const stats = allRooms.reduce((acc, room) => {
        acc.total++;
        acc.byStatus[room.status || 'Unknown'] = (acc.byStatus[room.status || 'Unknown'] || 0) + 1;
        const typeKey = room.room_type_id ? String(room.room_type_id) : 'none';
        acc.byType[typeKey] = (acc.byType[typeKey] || 0) + 1;
        return acc;
      }, {
        total: 0,
        byStatus: {},
        byType: {}
      });

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Get room stats error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new RoomController();
