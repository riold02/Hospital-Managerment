const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');
const roomController = require('../controllers/roomController');
const roomAssignmentController = require('../controllers/roomAssignmentController');
const { validateRoomType, validateRoom, validateRoomUpdate, validateRoomAssignment, validateRoomAssignmentUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     RoomType:
 *       type: object
 *       required:
 *         - type_name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated room type ID
 *         type_name:
 *           type: string
 *           maxLength: 50
 *           description: Room type name
 *         description:
 *           type: string
 *           description: Room type description
 *         base_price:
 *           type: number
 *           format: decimal
 *           description: Base price per day
 *         is_active:
 *           type: boolean
 *           description: Whether the room type is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     Room:
 *       type: object
 *       required:
 *         - room_number
 *         - room_type_id
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated room ID
 *         room_number:
 *           type: string
 *           maxLength: 20
 *           description: Room number
 *         room_type_id:
 *           type: integer
 *           description: Room type ID
 *         status:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_ORDER]
 *           description: Room status
 *         description:
 *           type: string
 *           description: Room description
 *         is_active:
 *           type: boolean
 *           description: Whether the room is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     RoomAssignment:
 *       type: object
 *       required:
 *         - room_id
 *         - assignment_type
 *         - start_date
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated assignment ID
 *         room_id:
 *           type: integer
 *           description: Room ID
 *         assignment_type:
 *           type: string
 *           enum: [PATIENT, STAFF]
 *           description: Assignment type
 *         patient_id:
 *           type: integer
 *           description: Patient ID (for patient assignments)
 *         staff_id:
 *           type: integer
 *           description: Staff ID (for staff assignments)
 *         start_date:
 *           type: string
 *           format: date
 *           description: Assignment start date
 *         end_date:
 *           type: string
 *           format: date
 *           description: Assignment end date
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

// Room Types Routes
/**
 * @swagger
 * /api/v1/room-types:
 *   get:
 *     summary: Get all room types
 *     tags: [Room Management]
 *     responses:
 *       200:
 *         description: List of room types
 */
router.get('/room-types', roomTypeController.getAllRoomTypes);

/**
 * @swagger
 * /api/v1/room-types:
 *   post:
 *     summary: Create a new room type
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type_name
 *             properties:
 *               type_name:
 *                 type: string
 *                 maxLength: 50
 *               description:
 *                 type: string
 *               base_price:
 *                 type: number
 *                 format: decimal
 *     responses:
 *       201:
 *         description: Room type created successfully
 */
router.post('/room-types', authenticateToken, requireAdmin, validateRoomType, roomTypeController.createRoomType);

/**
 * @swagger
 * /api/v1/room-types/{id}:
 *   get:
 *     summary: Get room type by ID
 *     tags: [Room Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room type details
 */
router.get('/room-types/:id', roomTypeController.getRoomTypeById);

/**
 * @swagger
 * /api/v1/room-types/{id}:
 *   put:
 *     summary: Update room type
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room type updated successfully
 */
router.put('/room-types/:id', authenticateToken, requireAdmin, validateRoomType, roomTypeController.updateRoomType);

/**
 * @swagger
 * /api/v1/room-types/{id}:
 *   delete:
 *     summary: Delete room type
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room type deleted successfully
 */
router.delete('/room-types/:id', authenticateToken, requireAdmin, roomTypeController.deleteRoomType);

// Rooms Routes
/**
 * @swagger
 * /api/v1/rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room_type_id
 *         schema:
 *           type: integer
 *         description: Filter by room type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_ORDER]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of rooms
 */
router.get('/rooms', authenticateToken, roomController.getAllRooms);

/**
 * @swagger
 * /api/v1/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_number
 *               - room_type_id
 *             properties:
 *               room_number:
 *                 type: string
 *                 maxLength: 20
 *               room_type_id:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, OCCUPIED, MAINTENANCE, OUT_OF_ORDER]
 *                 default: AVAILABLE
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room created successfully
 */
router.post('/rooms', authenticateToken, requireStaff, validateRoom, roomController.createRoom);

/**
 * @swagger
 * /api/v1/rooms/available:
 *   get:
 *     summary: Get available rooms
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room_type_id
 *         schema:
 *           type: integer
 *         description: Filter by room type
 *     responses:
 *       200:
 *         description: List of available rooms
 */
router.get('/rooms/available', authenticateToken, roomController.getAvailableRooms);

/**
 * @swagger
 * /api/v1/rooms/stats:
 *   get:
 *     summary: Get room statistics
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Room statistics
 */
router.get('/rooms/stats', authenticateToken, requireStaff, roomController.getRoomStats);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room details
 */
router.get('/rooms/:id', authenticateToken, roomController.getRoomById);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   put:
 *     summary: Update room
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room updated successfully
 */
router.put('/rooms/:id', authenticateToken, requireStaff, validateRoomUpdate, roomController.updateRoom);

/**
 * @swagger
 * /api/v1/rooms/{id}:
 *   delete:
 *     summary: Delete room
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room deleted successfully
 */
router.delete('/rooms/:id', authenticateToken, requireAdmin, roomController.deleteRoom);

// Room Assignments Routes
/**
 * @swagger
 * /api/v1/room-assignments:
 *   get:
 *     summary: Get all room assignments
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *         description: Filter by room ID
 *       - in: query
 *         name: assignment_type
 *         schema:
 *           type: string
 *           enum: [PATIENT, STAFF]
 *         description: Filter by assignment type
 *       - in: query
 *         name: active_only
 *         schema:
 *           type: boolean
 *         description: Show only active assignments
 *     responses:
 *       200:
 *         description: List of room assignments
 */
router.get('/room-assignments', authenticateToken, roomAssignmentController.getAllRoomAssignments);

/**
 * @swagger
 * /api/v1/room-assignments:
 *   post:
 *     summary: Create room assignment
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - room_id
 *               - assignment_type
 *               - start_date
 *             properties:
 *               room_id:
 *                 type: integer
 *               assignment_type:
 *                 type: string
 *                 enum: [PATIENT, STAFF]
 *               patient_id:
 *                 type: integer
 *                 description: Required for PATIENT assignments
 *               staff_id:
 *                 type: integer
 *                 description: Required for STAFF assignments
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Room assignment created successfully
 */
router.post('/room-assignments', authenticateToken, requireStaff, validateRoomAssignment, roomAssignmentController.createRoomAssignment);

/**
 * @swagger
 * /api/v1/room-assignments/{id}:
 *   get:
 *     summary: Get room assignment by ID
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room assignment details
 */
router.get('/room-assignments/:id', authenticateToken, roomAssignmentController.getRoomAssignmentById);

/**
 * @swagger
 * /api/v1/room-assignments/{id}:
 *   put:
 *     summary: Update room assignment
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room assignment updated successfully
 */
router.put('/room-assignments/:id', authenticateToken, requireStaff, validateRoomAssignmentUpdate, roomAssignmentController.updateRoomAssignment);

/**
 * @swagger
 * /api/v1/room-assignments/{id}/end:
 *   patch:
 *     summary: End room assignment
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room assignment ended successfully
 */
router.patch('/room-assignments/:id/end', authenticateToken, requireStaff, roomAssignmentController.endRoomAssignment);

/**
 * @swagger
 * /api/v1/room-assignments/{id}:
 *   delete:
 *     summary: Delete room assignment
 *     tags: [Room Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room assignment deleted successfully
 */
router.delete('/room-assignments/:id', authenticateToken, requireStaff, roomAssignmentController.deleteRoomAssignment);

module.exports = router;
