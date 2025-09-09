const express = require('express');
const router = express.Router();
const cleaningServiceController = require('../controllers/cleaningServiceController');
const { validateCleaningService, validateCleaningServiceUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     CleaningService:
 *       type: object
 *       required:
 *         - room_id
 *         - cleaning_type
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated cleaning service ID
 *         room_id:
 *           type: integer
 *           description: Room ID
 *         cleaning_type:
 *           type: string
 *           enum: [ROUTINE, DEEP_CLEAN, DISINFECTION, MAINTENANCE]
 *           description: Type of cleaning
 *         cleaning_date:
 *           type: string
 *           format: date
 *           description: Date of cleaning
 *         start_time:
 *           type: string
 *           format: time
 *           description: Start time of cleaning
 *         end_time:
 *           type: string
 *           format: time
 *           description: End time of cleaning
 *         cleaned_by:
 *           type: integer
 *           description: Staff ID who performed cleaning
 *         notes:
 *           type: string
 *           description: Cleaning notes
 *         supplies_used:
 *           type: string
 *           description: Supplies used for cleaning
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/cleaning-service:
 *   get:
 *     summary: Get all cleaning service records
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *         description: Filter by room ID
 *       - in: query
 *         name: cleaned_by
 *         schema:
 *           type: integer
 *         description: Filter by staff who cleaned
 *       - in: query
 *         name: cleaning_type
 *         schema:
 *           type: string
 *           enum: [ROUTINE, DEEP_CLEAN, DISINFECTION, MAINTENANCE]
 *         description: Filter by cleaning type
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records from this date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter records to this date
 *     responses:
 *       200:
 *         description: List of cleaning service records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CleaningService'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, requireStaff, cleaningServiceController.getAllCleaningServices);

/**
 * @swagger
 * /api/v1/cleaning-service:
 *   post:
 *     summary: Create a new cleaning service record
 *     tags: [Cleaning Service]
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
 *               - cleaning_type
 *             properties:
 *               room_id:
 *                 type: integer
 *               cleaning_type:
 *                 type: string
 *                 enum: [ROUTINE, DEEP_CLEAN, DISINFECTION, MAINTENANCE]
 *               cleaning_date:
 *                 type: string
 *                 format: date
 *                 description: Defaults to today if not provided
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               notes:
 *                 type: string
 *               supplies_used:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cleaning service record created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireStaff, validateCleaningService, cleaningServiceController.createCleaningService);

/**
 * @swagger
 * /api/v1/cleaning-service/stats:
 *   get:
 *     summary: Get cleaning service statistics
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter statistics from this date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter statistics to this date
 *     responses:
 *       200:
 *         description: Cleaning service statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byType:
 *                       type: object
 *                     byRoom:
 *                       type: object
 *                     byStaff:
 *                       type: object
 */
router.get('/stats', authenticateToken, requireStaff, cleaningServiceController.getCleaningStats);

/**
 * @swagger
 * /api/v1/cleaning-service/daily-report:
 *   get:
 *     summary: Get daily cleaning report
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for the report (defaults to today)
 *     responses:
 *       200:
 *         description: Daily cleaning report
 */
router.get('/daily-report', authenticateToken, requireStaff, cleaningServiceController.getDailyCleaningReport);

/**
 * @swagger
 * /api/v1/cleaning-service/room/{room_id}:
 *   get:
 *     summary: Get room cleaning history
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: room_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room cleaning history
 */
router.get('/room/:room_id', authenticateToken, requireStaff, cleaningServiceController.getRoomCleaningHistory);

/**
 * @swagger
 * /api/v1/cleaning-service/{id}:
 *   get:
 *     summary: Get cleaning service record by ID
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cleaning service record ID
 *     responses:
 *       200:
 *         description: Cleaning service record details
 *       404:
 *         description: Cleaning service record not found
 */
router.get('/:id', authenticateToken, requireStaff, cleaningServiceController.getCleaningServiceById);

/**
 * @swagger
 * /api/v1/cleaning-service/{id}:
 *   put:
 *     summary: Update cleaning service record
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cleaning service record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cleaning_type:
 *                 type: string
 *                 enum: [ROUTINE, DEEP_CLEAN, DISINFECTION, MAINTENANCE]
 *               cleaning_date:
 *                 type: string
 *                 format: date
 *               start_time:
 *                 type: string
 *                 format: time
 *               end_time:
 *                 type: string
 *                 format: time
 *               notes:
 *                 type: string
 *               supplies_used:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cleaning service record updated successfully
 *       404:
 *         description: Cleaning service record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireStaff, validateCleaningServiceUpdate, cleaningServiceController.updateCleaningService);

/**
 * @swagger
 * /api/v1/cleaning-service/{id}:
 *   delete:
 *     summary: Delete cleaning service record
 *     tags: [Cleaning Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cleaning service record ID
 *     responses:
 *       200:
 *         description: Cleaning service record deleted successfully
 *       404:
 *         description: Cleaning service record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireStaff, cleaningServiceController.deleteCleaningService);

module.exports = router;
