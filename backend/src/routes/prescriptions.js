const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { validatePrescription, validatePrescriptionUpdate } = require('../middleware/validation');
const { authenticateToken, requireDoctor, requireStaff } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Prescription:
 *       type: object
 *       required:
 *         - patient_id
 *         - diagnosis
 *         - medications
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated prescription ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         prescribed_by:
 *           type: integer
 *           description: Doctor ID who prescribed
 *         prescription_date:
 *           type: string
 *           format: date
 *           description: Prescription date
 *         diagnosis:
 *           type: string
 *           description: Medical diagnosis
 *         medications:
 *           type: string
 *           description: Prescribed medications
 *         dosage_instructions:
 *           type: string
 *           description: Dosage instructions
 *         duration:
 *           type: string
 *           description: Treatment duration
 *         notes:
 *           type: string
 *           description: Additional notes
 *         status:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *           description: Prescription status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/prescriptions:
 *   get:
 *     summary: Get all prescriptions
 *     tags: [Prescriptions]
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
 *         name: patient_id
 *         schema:
 *           type: integer
 *         description: Filter by patient ID
 *       - in: query
 *         name: prescribed_by
 *         schema:
 *           type: integer
 *         description: Filter by doctor ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *         description: Filter by status
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter prescriptions from this date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter prescriptions to this date
 *     responses:
 *       200:
 *         description: List of prescriptions
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
 *                     $ref: '#/components/schemas/Prescription'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, prescriptionController.getAllPrescriptions);

/**
 * @swagger
 * /api/v1/prescriptions:
 *   post:
 *     summary: Create a new prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patient_id
 *               - diagnosis
 *               - medications
 *             properties:
 *               patient_id:
 *                 type: integer
 *               prescription_date:
 *                 type: string
 *                 format: date
 *                 description: Defaults to today if not provided
 *               diagnosis:
 *                 type: string
 *               medications:
 *                 type: string
 *               dosage_instructions:
 *                 type: string
 *               duration:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *                 default: ACTIVE
 *     responses:
 *       201:
 *         description: Prescription created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireDoctor, validatePrescription, prescriptionController.createPrescription);

/**
 * @swagger
 * /api/v1/prescriptions/stats:
 *   get:
 *     summary: Get prescription statistics
 *     tags: [Prescriptions]
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
 *         description: Prescription statistics
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
 *                     byStatus:
 *                       type: object
 *                     byDoctor:
 *                       type: object
 */
router.get('/stats', authenticateToken, requireStaff, prescriptionController.getPrescriptionStats);

/**
 * @swagger
 * /api/v1/prescriptions/patient/{patient_id}:
 *   get:
 *     summary: Get patient's prescriptions
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Patient's prescriptions
 */
router.get('/patient/:patient_id', authenticateToken, prescriptionController.getPatientPrescriptions);

/**
 * @swagger
 * /api/v1/prescriptions/doctor/{doctor_id}:
 *   get:
 *     summary: Get doctor's prescriptions
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctor_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *         description: Filter by status
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *     responses:
 *       200:
 *         description: Doctor's prescriptions
 */
router.get('/doctor/:doctor_id', authenticateToken, prescriptionController.getDoctorPrescriptions);

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   get:
 *     summary: Get prescription by ID
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription details
 *       404:
 *         description: Prescription not found
 */
router.get('/:id', authenticateToken, prescriptionController.getPrescriptionById);

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   put:
 *     summary: Update prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               diagnosis:
 *                 type: string
 *               medications:
 *                 type: string
 *               dosage_instructions:
 *                 type: string
 *               duration:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, CANCELLED, EXPIRED]
 *     responses:
 *       200:
 *         description: Prescription updated successfully
 *       404:
 *         description: Prescription not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireDoctor, validatePrescriptionUpdate, prescriptionController.updatePrescription);

/**
 * @swagger
 * /api/v1/prescriptions/{id}:
 *   delete:
 *     summary: Delete prescription
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prescription ID
 *     responses:
 *       200:
 *         description: Prescription deleted successfully
 *       404:
 *         description: Prescription not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireDoctor, prescriptionController.deletePrescription);

module.exports = router;
