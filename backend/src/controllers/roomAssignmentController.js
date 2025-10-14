const { prisma } = require('../config/prisma');
const { validationResult } = require('express-validator');

class RoomAssignmentController {
  // Create room assignment
  async createRoomAssignment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { room_id, assignment_type, patient_id, staff_id, start_date, end_date } = req.body;

      // Validate assignment type and corresponding ID
      if (assignment_type === 'Patient' && !patient_id) {
        return res.status(400).json({
          success: false,
          error: 'Patient ID is required for patient assignment'
        });
      }

      if (assignment_type === 'Staff' && !staff_id) {
        return res.status(400).json({
          success: false,
          error: 'Staff ID is required for staff assignment'
        });
      }

      // Check if room exists
      const room = await prisma.rooms.findUnique({
        where: { room_id: Number(room_id) },
        select: { room_id: true, status: true, room_number: true }
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Check for conflicting assignments
      const conflictingCount = await prisma.room_assignments.count({
        where: {
          room_id: Number(room_id),
          end_date: null
        }
      });

      if (conflictingCount > 0 && assignment_type === 'Patient') {
        return res.status(409).json({
          success: false,
          error: 'Room is already occupied'
        });
      }

      // Use transaction to create assignment and update room status
      const result = await prisma.$transaction(async (tx) => {
        // Convert assignment_type to lowercase for database constraint
        const assignmentTypeLower = assignment_type.toLowerCase();
        
        const assignmentData = {
          room_id: Number(room_id),
          assignment_type: assignmentTypeLower,
          patient_id: assignmentTypeLower === 'patient' ? Number(patient_id) : null,
          staff_id: assignmentTypeLower === 'staff' ? Number(staff_id) : null,
          start_date: new Date(start_date),
          end_date: end_date ? new Date(end_date) : null
        };

        const assignment = await tx.room_assignments.create({
          data: assignmentData,
          include: {
            room: {
              select: {
                room_id: true,
                room_number: true,
                room_type: {
                  select: {
                    type_name: true
                  }
                }
              }
            },
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true,
                email: true
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

        // Update room occupancy and status if it's a patient assignment
        if (assignmentTypeLower === 'patient') {
          // Get current room info
          const room = await tx.rooms.findUnique({
            where: { room_id: Number(room_id) },
            select: { capacity: true, current_occupancy: true }
          });

          const newOccupancy = (room.current_occupancy || 0) + 1;
          const newStatus = newOccupancy >= room.capacity ? 'occupied' : 'available';

          await tx.rooms.update({
            where: { room_id: Number(room_id) },
            data: { 
              current_occupancy: newOccupancy,
              status: newStatus
            }
          });
        }

        return assignment;
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Room assignment created successfully'
      });
    } catch (error) {
      console.error('Create room assignment error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get all room assignments
  async getAllRoomAssignments(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        room_id,
        assignment_type,
        patient_id,
        staff_id,
        active_only,
        sortBy = 'start_date', 
        sortOrder = 'desc' 
      } = req.query;
      
      const offset = (page - 1) * limit;

      const where = {
        ...(room_id ? { room_id: Number(room_id) } : {}),
        ...(assignment_type ? { assignment_type } : {}),
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(staff_id ? { staff_id: Number(staff_id) } : {}),
        ...(active_only === 'true' ? { end_date: null } : {})
      };

      const [data, count] = await Promise.all([
        prisma.room_assignments.findMany({
          where,
          include: {
            room: {
              select: {
                room_id: true,
                room_number: true,
                room_type: {
                  select: {
                    type_name: true
                  }
                }
              }
            },
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true,
                email: true
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
        prisma.room_assignments.count({ where })
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
      console.error('Get all room assignments error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get room assignment by ID
  async getRoomAssignmentById(req, res) {
    try {
      const { id } = req.params;

      const data = await prisma.room_assignments.findUnique({
        where: { assignment_id: Number(id) },
        include: {
          room: {
            select: {
              room_id: true,
              room_number: true,
              status: true,
              room_type: {
                select: {
                  room_type_id: true,
                  type_name: true,
                  description: true
                }
              }
            }
          },
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              email: true,
              contact_number: true,
              date_of_birth: true,
              gender: true
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
          error: 'Room assignment not found'
        });
      }

      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get room assignment by ID error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update room assignment
  async updateRoomAssignment(req, res) {
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
        room_id: req.body.room_id ? Number(req.body.room_id) : undefined,
        assignment_type: req.body.assignment_type,
        patient_id: req.body.patient_id ? Number(req.body.patient_id) : undefined,
        staff_id: req.body.staff_id ? Number(req.body.staff_id) : undefined,
        start_date: req.body.start_date ? new Date(req.body.start_date) : undefined,
        end_date: req.body.end_date ? new Date(req.body.end_date) : undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const result = await prisma.$transaction(async (tx) => {
        const data = await tx.room_assignments.update({
          where: { assignment_id: Number(id) },
          data: updateData,
          include: {
            room: {
              select: {
                room_id: true,
                room_number: true,
                room_type: {
                  select: {
                    type_name: true
                  }
                }
              }
            },
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true
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

        // If end_date is set, update room occupancy and status
        if (updateData.end_date && data.assignment_type === 'patient') {
          // Get current room info
          const room = await tx.rooms.findUnique({
            where: { room_id: data.room_id },
            select: { capacity: true, current_occupancy: true }
          });

          const newOccupancy = Math.max((room.current_occupancy || 0) - 1, 0);
          const newStatus = newOccupancy === 0 ? 'available' : (newOccupancy >= room.capacity ? 'occupied' : 'available');

          await tx.rooms.update({
            where: { room_id: data.room_id },
            data: { 
              current_occupancy: newOccupancy,
              status: newStatus
            }
          });
        }

        return data;
      });

      res.json({
        success: true,
        data: result,
        message: 'Room assignment updated successfully'
      });
    } catch (error) {
      console.error('Update room assignment error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // End room assignment
  async endRoomAssignment(req, res) {
    try {
      const { id } = req.params;
      const endDate = new Date();

      const result = await prisma.$transaction(async (tx) => {
        const data = await tx.room_assignments.update({
          where: { 
            assignment_id: Number(id),
            end_date: null
          },
          data: { end_date: endDate },
          include: {
            room: {
              select: {
                room_id: true,
                room_number: true
              }
            }
          }
        });

        // Update room occupancy and status if it was a patient assignment
        if (data.assignment_type === 'patient') {
          // Get current room info
          const room = await tx.rooms.findUnique({
            where: { room_id: data.room_id },
            select: { capacity: true, current_occupancy: true }
          });

          const newOccupancy = Math.max((room.current_occupancy || 0) - 1, 0);
          const newStatus = newOccupancy === 0 ? 'available' : (newOccupancy >= room.capacity ? 'occupied' : 'available');

          await tx.rooms.update({
            where: { room_id: data.room_id },
            data: { 
              current_occupancy: newOccupancy,
              status: newStatus
            }
          });
        }

        return data;
      });

      res.json({
        success: true,
        data: result,
        message: 'Room assignment ended successfully'
      });
    } catch (error) {
      console.error('End room assignment error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Delete room assignment
  async deleteRoomAssignment(req, res) {
    try {
      const { id } = req.params;

      const result = await prisma.$transaction(async (tx) => {
        // Get assignment data before deletion
        const assignment = await tx.room_assignments.findUnique({
          where: { assignment_id: Number(id) },
          select: { assignment_type: true, end_date: true, room_id: true }
        });

        if (!assignment) {
          throw new Error('Room assignment not found');
        }

        // Delete the assignment
        await tx.room_assignments.delete({
          where: { assignment_id: Number(id) }
        });

        // Update room occupancy and status if it was an active patient assignment
        if (assignment.assignment_type === 'patient' && !assignment.end_date) {
          // Get current room info
          const room = await tx.rooms.findUnique({
            where: { room_id: assignment.room_id },
            select: { capacity: true, current_occupancy: true }
          });

          const newOccupancy = Math.max((room.current_occupancy || 0) - 1, 0);
          const newStatus = newOccupancy === 0 ? 'available' : (newOccupancy >= room.capacity ? 'occupied' : 'available');

          await tx.rooms.update({
            where: { room_id: assignment.room_id },
            data: { 
              current_occupancy: newOccupancy,
              status: newStatus
            }
          });
        }

        return assignment;
      });

      res.json({
        success: true,
        message: 'Room assignment deleted successfully'
      });
    } catch (error) {
      console.error('Delete room assignment error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new RoomAssignmentController();
