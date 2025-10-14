const express = require('express');
const router = express.Router();
const { AmbulanceController } = require('../controllers/ambulanceController');
const { validateAmbulance, validateAmbulanceUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff, requireAdmin, requireRole } = require('../middleware/auth');

// Driver Dashboard Routes
/**
 * @swagger
 * /api/v1/ambulances/driver/dashboard:
 *   get:
 *     summary: Get driver dashboard overview
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver dashboard data retrieved successfully
 */
router.get('/driver/dashboard', authenticateToken, requireRole('driver', 'admin'), AmbulanceController.getDriverDashboard);

/**
 * @swagger
 * /api/v1/ambulances/emergency-dispatches:
 *   get:
 *     summary: Get emergency dispatch requests
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, completed]
 *         description: Filter by dispatch status
 *     responses:
 *       200:
 *         description: Emergency dispatches retrieved successfully
 */
router.get('/emergency-dispatches', authenticateToken, requireRole('driver', 'admin'), AmbulanceController.getEmergencyDispatches);

/**
 * @swagger
 * /api/v1/ambulances/dispatches/{dispatchId}/accept:
 *   post:
 *     summary: Accept dispatch assignment
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dispatchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Dispatch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ambulance_id:
 *                 type: string
 *               estimated_arrival:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dispatch accepted successfully
 */
router.post('/dispatches/:dispatchId/accept', authenticateToken, requireRole('driver', 'admin'), AmbulanceController.acceptDispatch);

/**
 * @swagger
 * /api/v1/ambulances/transports/{transportId}/status:
 *   put:
 *     summary: Update transport status
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transport ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [en_route, arrived, completed]
 *               current_location:
 *                 type: string
 *               patient_condition:
 *                 type: string
 *               estimated_arrival:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transport status updated successfully
 */
router.put('/transports/:transportId/status', authenticateToken, requireRole('driver', 'admin'), AmbulanceController.updateTransportStatus);

/**
 * @swagger
 * components:
 *   schemas:
 *     Ambulance:
 *       type: object
 *       required:
 *         - vehicle_number
 *         - driver_name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ambulance ID
 *         vehicle_number:
 *           type: string
 *           maxLength: 20
 *           description: Vehicle number/license plate
 *         driver_name:
 *           type: string
 *           maxLength: 100
 *           description: Driver name
 *         driver_contact:
 *           type: string
 *           maxLength: 15
 *           description: Driver contact number
 *         model:
 *           type: string
 *           maxLength: 50
 *           description: Vehicle model
 *         availability:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE]
 *           description: Ambulance availability status
 *         equipment:
 *           type: string
 *           description: Medical equipment available
 *         is_active:
 *           type: boolean
 *           description: Whether the ambulance is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     AmbulanceLog:
 *       type: object
 *       required:
 *         - ambulance_id
 *         - patient_id
 *         - pickup_location
 *         - destination
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated log ID
 *         ambulance_id:
 *           type: integer
 *           description: Ambulance ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         pickup_location:
 *           type: string
 *           description: Pickup location
 *         destination:
 *           type: string
 *           description: Destination location
 *         dispatch_time:
 *           type: string
 *           format: date-time
 *           description: Dispatch time
 *         arrival_time:
 *           type: string
 *           format: date-time
 *           description: Arrival time at pickup
 *         completion_time:
 *           type: string
 *           format: date-time
 *           description: Completion time
 *         status:
 *           type: string
 *           enum: [DISPATCHED, EN_ROUTE, ON_SCENE, TRANSPORTING, COMPLETED, CANCELLED]
 *           description: Log status
 *         notes:
 *           type: string
 *           description: Additional notes
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

// Ambulance Routes
/**
 * @swagger
 * /api/v1/ambulances:
 *   get:
 *     summary: Get all ambulances
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE]
 *         description: Filter by availability
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for vehicle number, driver name, or model
 *     responses:
 *       200:
 *         description: List of ambulances
 */
router.get('/', authenticateToken, requireStaff, AmbulanceController.getAllAmbulances);

/**
 * @swagger
 * /api/v1/ambulances:
 *   post:
 *     summary: Create a new ambulance
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_number
 *               - driver_name
 *             properties:
 *               vehicle_number:
 *                 type: string
 *                 maxLength: 20
 *               driver_name:
 *                 type: string
 *                 maxLength: 100
 *               driver_contact:
 *                 type: string
 *                 maxLength: 15
 *               model:
 *                 type: string
 *                 maxLength: 50
 *               availability:
 *                 type: string
 *                 enum: [AVAILABLE, IN_USE, MAINTENANCE, OUT_OF_SERVICE]
 *                 default: AVAILABLE
 *               equipment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ambulance created successfully
 */
router.post('/', authenticateToken, requireAdmin, validateAmbulance, AmbulanceController.createAmbulance);

/**
 * @swagger
 * /api/v1/ambulances/available:
 *   get:
 *     summary: Get available ambulances
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available ambulances
 */
router.get('/available', authenticateToken, requireStaff, AmbulanceController.getAvailableAmbulances);

/**
 * @swagger
 * /api/v1/ambulances/stats:
 *   get:
 *     summary: Get ambulance statistics
 *     tags: [Ambulances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ambulance statistics
 */
router.get('/stats', authenticateToken, requireStaff, AmbulanceController.getAmbulanceStats);



/**
 * @swagger
 * /api/v1/ambulances/{id}:
 *   get:
 *     summary: Get ambulance by ID
 *     tags: [Ambulances]
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
 *         description: Ambulance details
 */
router.get('/:id', authenticateToken, requireStaff, AmbulanceController.getAmbulanceById);

/**
 * @swagger
 * /api/v1/ambulances/{id}:
 *   put:
 *     summary: Update ambulance
 *     tags: [Ambulances]
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
 *         description: Ambulance updated successfully
 */
router.put('/:id', authenticateToken, requireStaff, validateAmbulanceUpdate, AmbulanceController.updateAmbulance);

/**
 * @swagger
 * /api/v1/ambulances/{id}:
 *   delete:
 *     summary: Delete ambulance
 *     tags: [Ambulances]
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
 *         description: Ambulance deleted successfully
 */
router.delete('/:id', authenticateToken, requireAdmin, AmbulanceController.deleteAmbulance);

module.exports = router;
