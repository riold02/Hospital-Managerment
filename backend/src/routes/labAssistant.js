const express = require('express');
const router = express.Router();
const labAssistantController = require('../controllers/labAssistantController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply authentication and lab assistant role requirement to all routes
router.use(authenticateToken);
router.use(requireRole('lab_assistant', 'technician', 'admin'));

/**
 * @swagger
 * /api/v1/lab-assistant/dashboard:
 *   get:
 *     summary: Get lab assistant dashboard overview
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lab assistant dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized - Lab assistant access required
 */
router.get('/dashboard', labAssistantController.getLabAssistantDashboard);

/**
 * @swagger
 * /api/v1/lab-assistant/samples-to-collect:
 *   get:
 *     summary: Get samples that need to be collected
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [urgent, routine]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Samples to collect retrieved successfully
 */
router.get('/samples-to-collect', labAssistantController.getSamplesToCollect);

/**
 * @swagger
 * /api/v1/lab-assistant/samples/{sampleId}/collect:
 *   post:
 *     summary: Record sample collection
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sample/Test request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               collection_time:
 *                 type: string
 *                 format: date-time
 *                 description: Time of sample collection
 *               sample_type:
 *                 type: string
 *                 description: Type of sample (blood, urine, etc.)
 *               collection_method:
 *                 type: string
 *                 description: Method used for collection
 *               container_type:
 *                 type: string
 *                 description: Container used for sample
 *               volume_collected:
 *                 type: string
 *                 description: Volume of sample collected
 *               fasting_status:
 *                 type: string
 *                 enum: [fasting, non-fasting, unknown]
 *                 description: Patient fasting status
 *               notes:
 *                 type: string
 *                 description: Additional collection notes
 *     responses:
 *       200:
 *         description: Sample collection recorded successfully
 */
router.post('/samples/:sampleId/collect', labAssistantController.recordSampleCollection);

/**
 * @swagger
 * /api/v1/lab-assistant/processing-queue:
 *   get:
 *     summary: Get sample processing queue
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: test_type
 *         schema:
 *           type: string
 *         description: Filter by test type
 *     responses:
 *       200:
 *         description: Sample processing queue retrieved successfully
 */
router.get('/processing-queue', labAssistantController.getSampleProcessingQueue);

/**
 * @swagger
 * /api/v1/lab-assistant/samples/{sampleId}/processing-status:
 *   put:
 *     summary: Update sample processing status
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sampleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sample ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [received, processing, ready, rejected]
 *                 description: Processing status
 *               processing_notes:
 *                 type: string
 *                 description: Processing notes
 *               quality_check:
 *                 type: string
 *                 enum: [passed, failed, acceptable]
 *                 description: Quality check result
 *     responses:
 *       200:
 *         description: Sample processing status updated successfully
 */
router.put('/samples/:sampleId/processing-status', labAssistantController.updateSampleProcessingStatus);

/**
 * @swagger
 * /api/v1/lab-assistant/inventory:
 *   get:
 *     summary: Get lab inventory (supplies, reagents)
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Filter items with low stock
 *     responses:
 *       200:
 *         description: Lab inventory retrieved successfully
 */
router.get('/inventory', labAssistantController.getLabInventory);

/**
 * @swagger
 * /api/v1/lab-assistant/inventory/restock-request:
 *   post:
 *     summary: Request inventory restocking
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     item_id:
 *                       type: integer
 *                     item_name:
 *                       type: string
 *                     requested_quantity:
 *                       type: integer
 *                     urgency:
 *                       type: string
 *                       enum: [low, medium, high, critical]
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Overall request urgency
 *               notes:
 *                 type: string
 *                 description: Additional notes for the request
 *     responses:
 *       201:
 *         description: Restock request submitted successfully
 */
router.post('/inventory/restock-request', labAssistantController.requestInventoryRestock);

/**
 * @swagger
 * /api/v1/lab-assistant/collection-schedule:
 *   get:
 *     summary: Get sample collection schedule
 *     tags: [Lab Assistant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Schedule date (defaults to today)
 *     responses:
 *       200:
 *         description: Collection schedule retrieved successfully
 */
router.get('/collection-schedule', labAssistantController.getCollectionSchedule);

module.exports = router;