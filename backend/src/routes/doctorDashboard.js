const express = require('express');
const router = express.Router();
const doctorDashboardController = require('../controllers/doctorDashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Apply authentication and role check to all routes
router.use(authenticateToken);
router.use(requireRole('doctor', 'admin'));

/**
 * @swagger
 * /api/v1/doctor/dashboard:
 *   get:
 *     summary: Get doctor dashboard overview
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor dashboard data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/dashboard', doctorDashboardController.getDoctorDashboard);

/**
 * @swagger
 * /api/v1/doctor/appointments:
 *   get:
 *     summary: Get doctor appointments
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by appointment date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by appointment status
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
 *     responses:
 *       200:
 *         description: List of doctor appointments
 */
router.get('/appointments', doctorDashboardController.getDoctorAppointments);

/**
 * @swagger
 * /api/v1/doctor/patients:
 *   get:
 *     summary: Get doctor patients
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name or code
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
 *     responses:
 *       200:
 *         description: List of doctor patients
 */
router.get('/patients', doctorDashboardController.getDoctorPatients);

/**
 * @swagger
 * /api/v1/doctor/patients/{patientId}/medical-records:
 *   get:
 *     summary: Get patient medical records
 *     tags: [Doctor Dashboard]
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
 *     responses:
 *       200:
 *         description: Patient medical records
 */
router.get('/patients/:patientId/medical-records', doctorDashboardController.getPatientMedicalRecords);

/**
 * @swagger
 * /api/v1/doctor/prescriptions:
 *   get:
 *     summary: Get doctor prescriptions
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by prescription status
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
 *     responses:
 *       200:
 *         description: List of doctor prescriptions
 */
router.get('/prescriptions', doctorDashboardController.getDoctorPrescriptions);

/**
 * @swagger
 * /api/v1/doctor/schedule:
 *   get:
 *     summary: Get doctor schedule
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor schedule information
 *       404:
 *         description: Doctor not found
 */
router.get('/schedule', doctorDashboardController.getDoctorSchedule);

/**
 * @swagger
 * /api/v1/doctor/schedule:
 *   put:
 *     summary: Update doctor schedule
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               available_schedule:
 *                 type: string
 *                 description: Doctor's available schedule
 *     responses:
 *       200:
 *         description: Schedule updated successfully
 *       404:
 *         description: Doctor not found
 */
router.put('/schedule', doctorDashboardController.updateDoctorSchedule);

/**
 * @swagger
 * /doctor/medical-records:
 *   get:
 *     summary: Get medical records for doctor's patients
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/medical-records', doctorDashboardController.getDoctorMedicalRecords);

/**
 * @swagger
 * /doctor/statistics:
 *   get:
 *     summary: Get doctor statistics
 *     tags: [Doctor Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', doctorDashboardController.getDoctorStatistics);

module.exports = router;
