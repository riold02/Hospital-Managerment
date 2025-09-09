const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { validatePatient, validatePatientUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - date_of_birth
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated patient ID
 *         first_name:
 *           type: string
 *           maxLength: 50
 *           description: Patient's first name
 *         last_name:
 *           type: string
 *           maxLength: 50
 *           description: Patient's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Patient's email address
 *         contact_number:
 *           type: string
 *           maxLength: 15
 *           description: Patient's contact number
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: Patient's date of birth
 *         gender:
 *           type: string
 *           enum: [M, F, O]
 *           description: Patient's gender
 *         address:
 *           type: string
 *           description: Patient's address
 *         medical_history:
 *           type: string
 *           description: Patient's medical history
 *         is_active:
 *           type: boolean
 *           description: Whether the patient record is active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Record last update timestamp
 */

/**
 * @swagger
 * /api/v1/patients:
 *   post:
 *     summary: Create a new patient
 *     tags: [Patients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - date_of_birth
 *             properties:
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               contact_number:
 *                 type: string
 *                 maxLength: 15
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               address:
 *                 type: string
 *               medical_history:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       409:
 *         description: Patient with email already exists
 */
router.post('/', validatePatient, patientController.createPatient);

/**
 * @swagger
 * /api/v1/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Patients]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [M, F, O]
 *         description: Filter by gender
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [first_name, last_name, email, created_at]
 *           default: created_at
 *         description: Sort by field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of patients
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
 *                     $ref: '#/components/schemas/Patient'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 */
router.get('/', patientController.getAllPatients);

/**
 * @swagger
 * /api/v1/patients/stats:
 *   get:
 *     summary: Get patient statistics
 *     tags: [Patients]
 *     responses:
 *       200:
 *         description: Patient statistics
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
 *                     male:
 *                       type: integer
 *                     female:
 *                       type: integer
 *                     other:
 *                       type: integer
 */
router.get('/stats', patientController.getPatientStats);

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *       404:
 *         description: Patient not found
 */
router.get('/:id', patientController.getPatientById);

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 maxLength: 50
 *               last_name:
 *                 type: string
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               contact_number:
 *                 type: string
 *                 maxLength: 15
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               address:
 *                 type: string
 *               medical_history:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Patient'
 *                 message:
 *                   type: string
 *       404:
 *         description: Patient not found
 *       409:
 *         description: Patient with email already exists
 */
router.put('/:id', validatePatientUpdate, patientController.updatePatient);

/**
 * @swagger
 * /api/v1/patients/{id}:
 *   delete:
 *     summary: Delete patient (soft delete)
 *     tags: [Patients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Patient not found
 */
router.delete('/:id', patientController.deletePatient);

module.exports = router;
