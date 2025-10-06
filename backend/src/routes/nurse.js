const express = require('express');
const router = express.Router();
const nurseController = require('../controllers/nurseController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply authentication and nurse role requirement to all nurse routes
router.use(authenticateToken);
router.use(requireRole(['nurse', 'admin']));

/**
 * @swagger
 * /api/v1/nurse/dashboard:
 *   get:
 *     summary: Get nurse dashboard overview
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nurse dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized - Nurse access required
 */
router.get('/dashboard', nurseController.getNurseDashboard);

/**
 * @swagger
 * /api/v1/nurse/patient-assignments:
 *   get:
 *     summary: Get nurse's patient assignments
 *     tags: [Nurse]
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
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by assignment status
 *     responses:
 *       200:
 *         description: Patient assignments retrieved successfully
 */
router.get('/patient-assignments', nurseController.getAssignedPatients);

/**
 * @swagger
 * /api/v1/nurse/vital-signs:
 *   post:
 *     summary: Record patient vital signs
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *               temperature:
 *                 type: number
 *               blood_pressure_systolic:
 *                 type: integer
 *               blood_pressure_diastolic:
 *                 type: integer
 *               heart_rate:
 *                 type: integer
 *               respiratory_rate:
 *                 type: integer
 *               oxygen_saturation:
 *                 type: number
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vital signs recorded successfully
 */
router.post('/vital-signs', nurseController.recordVitalSigns);

/**
 * @swagger
 * /api/v1/nurse/vital-signs/{patientId}:
 *   get:
 *     summary: Get patient's vital signs history
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days to look back
 *     responses:
 *       200:
 *         description: Vital signs history retrieved successfully
 */
// router.get('/vital-signs/:patientId', nurseController.getVitalSignsHistory);

/**
 * @swagger
 * /api/v1/nurse/medication-schedule:
 *   get:
 *     summary: Get medication administration schedule
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Schedule date (defaults to today)
 *       - in: query
 *         name: shift
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, night]
 *         description: Filter by shift
 *     responses:
 *       200:
 *         description: Medication schedule retrieved successfully
 */
router.get('/medication-schedule', nurseController.getMedicationSchedule);

/**
 * @swagger
 * /api/v1/nurse/medication-administration:
 *   post:
 *     summary: Record medication administration
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prescription_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               medicine_id:
 *                 type: integer
 *               dosage_given:
 *                 type: string
 *               administration_time:
 *                 type: string
 *                 format: date-time
 *               route:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medication administration recorded successfully
 */
router.post('/medication-administration', nurseController.recordMedicationAdministration);

/**
 * @swagger
 * /api/v1/nurse/patient-care-plan:
 *   post:
 *     summary: Create or update patient care plan
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: integer
 *               care_goals:
 *                 type: array
 *                 items:
 *                   type: string
 *               interventions:
 *                 type: array
 *                 items:
 *                   type: string
 *               evaluation_criteria:
 *                 type: string
 *               priority_level:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *     responses:
 *       201:
 *         description: Care plan created/updated successfully
 */
// router.post('/patient-care-plan', nurseController.updateCarePlan);

/**
 * @swagger
 * /api/v1/nurse/patient-care-plan/{patientId}:
 *   get:
 *     summary: Get patient's care plan
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Care plan retrieved successfully
 */
// router.get('/patient-care-plan/:patientId', nurseController.getCarePlan);

/**
 * @swagger
 * /api/v1/nurse/shift-report:
 *   get:
 *     summary: Get shift handover report
 *     tags: [Nurse]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shift_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Report date
 *       - in: query
 *         name: shift_type
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, night]
 *         description: Shift type
 *     responses:
 *       200:
 *         description: Shift report retrieved successfully
 */
// router.get('/shift-report', nurseController.getShiftReport);

module.exports = router;