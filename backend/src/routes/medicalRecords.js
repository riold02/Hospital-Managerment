const express = require('express');
const router = express.Router();
const medicalRecordController = require('../controllers/medicalRecordController');
const { validateMedicalRecord, validateMedicalRecordUpdate, validateMedicalRecordMedicine } = require('../middleware/validation');
const { authenticateToken, requireStaff, requireDoctor, requireRole } = require('../middleware/auth');

// Technician Dashboard Routes
/**
 * @swagger
 * /api/v1/medical-records/technician/dashboard:
 *   get:
 *     summary: Get technician dashboard overview
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Technician dashboard data retrieved successfully
 */
router.get('/technician/dashboard', authenticateToken, requireRole('technician', 'admin'), medicalRecordController.getTechnicianDashboard);

/**
 * @swagger
 * /api/v1/medical-records/tests/{testId}/result:
 *   post:
 *     summary: Record test result
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Test request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               results:
 *                 type: object
 *                 description: Test results data
 *               reference_ranges:
 *                 type: string
 *                 description: Reference ranges for the test
 *               interpretation:
 *                 type: string
 *                 description: Result interpretation
 *               technician_notes:
 *                 type: string
 *                 description: Technician notes
 *               critical_flag:
 *                 type: boolean
 *                 description: Whether result is critical
 *     responses:
 *       200:
 *         description: Test result recorded successfully
 */
router.post('/tests/:testId/result', authenticateToken, requireRole('technician', 'admin'), medicalRecordController.recordTestResult);

/**
 * @swagger
 * components:
 *   schemas:
 *     MedicalRecord:
 *       type: object
 *       required:
 *         - patient_id
 *         - doctor_id
 *         - visit_date
 *         - diagnosis
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated medical record ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         doctor_id:
 *           type: integer
 *           description: Doctor ID
 *         visit_date:
 *           type: string
 *           format: date
 *           description: Visit date
 *         diagnosis:
 *           type: string
 *           description: Medical diagnosis
 *         treatment:
 *           type: string
 *           description: Treatment provided
 *         notes:
 *           type: string
 *           description: Additional notes
 *         follow_up_date:
 *           type: string
 *           format: date
 *           description: Follow-up date
 *         is_active:
 *           type: boolean
 *           description: Whether the record is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/medical-records:
 *   get:
 *     summary: Get all medical records
 *     tags: [Medical Records]
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
 *         name: doctor_id
 *         schema:
 *           type: integer
 *         description: Filter by doctor ID
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
 *       - in: query
 *         name: diagnosis
 *         schema:
 *           type: string
 *         description: Filter by diagnosis
 *     responses:
 *       200:
 *         description: List of medical records
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
 *                     $ref: '#/components/schemas/MedicalRecord'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, medicalRecordController.getAllMedicalRecords);

/**
 * @swagger
 * /api/v1/medical-records:
 *   post:
 *     summary: Create a new medical record
 *     tags: [Medical Records]
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
 *               - doctor_id
 *               - visit_date
 *               - diagnosis
 *             properties:
 *               patient_id:
 *                 type: integer
 *               doctor_id:
 *                 type: integer
 *               visit_date:
 *                 type: string
 *                 format: date
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               notes:
 *                 type: string
 *               follow_up_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Medical record created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireDoctor, validateMedicalRecord, medicalRecordController.createMedicalRecord);

/**
 * @swagger
 * /api/v1/medical-records/{id}:
 *   get:
 *     summary: Get medical record by ID
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medical record ID
 *     responses:
 *       200:
 *         description: Medical record details with medicines
 *       404:
 *         description: Medical record not found
 */
router.get('/:id', authenticateToken, medicalRecordController.getMedicalRecordById);

/**
 * @swagger
 * /api/v1/medical-records/{id}:
 *   put:
 *     summary: Update medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medical record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visit_date:
 *                 type: string
 *                 format: date
 *               diagnosis:
 *                 type: string
 *               treatment:
 *                 type: string
 *               notes:
 *                 type: string
 *               follow_up_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Medical record updated successfully
 *       404:
 *         description: Medical record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireDoctor, validateMedicalRecordUpdate, medicalRecordController.updateMedicalRecord);

/**
 * @swagger
 * /api/v1/medical-records/{id}:
 *   delete:
 *     summary: Delete medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medical record ID
 *     responses:
 *       200:
 *         description: Medical record deleted successfully
 *       404:
 *         description: Medical record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireDoctor, medicalRecordController.deleteMedicalRecord);

/**
 * @swagger
 * /api/v1/medical-records/{id}/medicines:
 *   post:
 *     summary: Add medicine to medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medical record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicine_id
 *               - dosage
 *               - frequency
 *             properties:
 *               medicine_id:
 *                 type: integer
 *               dosage:
 *                 type: string
 *               frequency:
 *                 type: string
 *               duration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medicine added to medical record successfully
 *       404:
 *         description: Medical record not found
 *       409:
 *         description: Medicine is already assigned to this medical record
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/:id/medicines', authenticateToken, requireDoctor, validateMedicalRecordMedicine, medicalRecordController.addMedicineToRecord);

/**
 * @swagger
 * /api/v1/medical-records/{id}/medicines/{medicine_id}:
 *   delete:
 *     summary: Remove medicine from medical record
 *     tags: [Medical Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medical record ID
 *       - in: path
 *         name: medicine_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine removed from medical record successfully
 *       404:
 *         description: Medicine assignment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id/medicines/:medicine_id', authenticateToken, requireDoctor, medicalRecordController.removeMedicineFromRecord);

module.exports = router;
