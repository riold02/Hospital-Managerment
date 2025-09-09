const express = require('express');
const router = express.Router();
const { AmbulanceLogController } = require('../controllers/ambulanceController');
const { validateAmbulanceLog, validateAmbulanceLogUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/ambulance-log:
 *   get:
 *     summary: Get all ambulance logs
 *     tags: [Ambulance Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of ambulance logs
 */
router.get('/', authenticateToken, requireStaff, AmbulanceLogController.getAllAmbulanceLogs);

/**
 * @swagger
 * /api/v1/ambulance-log:
 *   post:
 *     summary: Create a new ambulance log
 *     tags: [Ambulance Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ambulance_id
 *               - patient_id
 *               - pickup_location
 *               - dropoff_location
 *             properties:
 *               ambulance_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               pickup_location:
 *                 type: string
 *                 maxLength: 255
 *               dropoff_location:
 *                 type: string
 *                 maxLength: 255
 *               pickup_time:
 *                 type: string
 *                 format: date-time
 *               dropoff_time:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [PENDING, IN_PROGRESS, COMPLETED, CANCELLED]
 *                 default: PENDING
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ambulance log created successfully
 */
router.post('/', authenticateToken, requireStaff, validateAmbulanceLog, AmbulanceLogController.createAmbulanceLog);

/**
 * @swagger
 * /api/v1/ambulance-log/stats:
 *   get:
 *     summary: Get ambulance log statistics
 *     tags: [Ambulance Logs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ambulance log statistics
 */
router.get('/stats', authenticateToken, requireStaff, AmbulanceLogController.getAmbulanceLogStats);

/**
 * @swagger
 * /api/v1/ambulance-log/{id}:
 *   get:
 *     summary: Get ambulance log by ID
 *     tags: [Ambulance Logs]
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
 *         description: Ambulance log details
 */
router.get('/:id', authenticateToken, requireStaff, AmbulanceLogController.getAmbulanceLogById);

/**
 * @swagger
 * /api/v1/ambulance-log/{id}:
 *   put:
 *     summary: Update ambulance log
 *     tags: [Ambulance Logs]
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
 *         description: Ambulance log updated successfully
 */
router.put('/:id', authenticateToken, requireStaff, validateAmbulanceLogUpdate, AmbulanceLogController.updateAmbulanceLog);

module.exports = router;
