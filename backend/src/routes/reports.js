const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken, requireStaff } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/reports/patient-history/{id}:
 *   get:
 *     summary: Get comprehensive patient history
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Complete patient history including appointments, medical records, prescriptions, billing, and pharmacy records
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
 *                     patient:
 *                       type: object
 *                       description: Patient basic information
 *                     appointments:
 *                       type: array
 *                       description: Patient's appointment history
 *                     medicalRecords:
 *                       type: array
 *                       description: Patient's medical records with medicines
 *                     prescriptions:
 *                       type: array
 *                       description: Patient's prescription history
 *                     billing:
 *                       type: array
 *                       description: Patient's billing history
 *                     pharmacy:
 *                       type: array
 *                       description: Patient's pharmacy/medication dispensing history
 *       404:
 *         description: Patient not found
 */
router.get('/patient-history/:id', authenticateToken, requireStaff, reportsController.getPatientHistory);

/**
 * @swagger
 * /api/v1/reports/doctor-appointments/{id}:
 *   get:
 *     summary: Get doctor's appointment report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Doctor ID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments from this date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter appointments to this date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW]
 *         description: Filter by appointment status
 *     responses:
 *       200:
 *         description: Doctor's appointment report with statistics
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
 *                     doctor:
 *                       type: object
 *                       description: Doctor basic information
 *                     appointments:
 *                       type: array
 *                       description: Doctor's appointments with patient details
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         byStatus:
 *                           type: object
 *                         byDate:
 *                           type: object
 *       404:
 *         description: Doctor not found
 */
router.get('/doctor-appointments/:id', authenticateToken, requireStaff, reportsController.getDoctorAppointments);

/**
 * @swagger
 * /api/v1/reports/room-usage:
 *   get:
 *     summary: Get room usage report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter room assignments from this date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter room assignments to this date
 *     responses:
 *       200:
 *         description: Comprehensive room usage report
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
 *                     rooms:
 *                       type: array
 *                       description: Detailed room information with assignment history
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalRooms:
 *                           type: integer
 *                         occupiedRooms:
 *                           type: integer
 *                         availableRooms:
 *                           type: integer
 *                         occupancyRate:
 *                           type: string
 *                           description: Occupancy rate as percentage
 *                         byRoomType:
 *                           type: object
 *                           description: Statistics grouped by room type
 */
router.get('/room-usage', authenticateToken, requireStaff, reportsController.getRoomUsage);

/**
 * @swagger
 * /api/v1/reports/billing-summary:
 *   get:
 *     summary: Get billing summary report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter billing records from this date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter billing records to this date
 *     responses:
 *       200:
 *         description: Comprehensive billing summary with revenue analysis
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                           description: Total revenue amount
 *                         totalRecords:
 *                           type: integer
 *                           description: Total number of billing records
 *                         paidAmount:
 *                           type: number
 *                           description: Total paid amount
 *                         paidCount:
 *                           type: integer
 *                           description: Number of paid records
 *                         pendingAmount:
 *                           type: number
 *                           description: Total pending amount
 *                         pendingCount:
 *                           type: integer
 *                           description: Number of pending records
 *                         overdueAmount:
 *                           type: number
 *                           description: Total overdue amount
 *                         overdueCount:
 *                           type: integer
 *                           description: Number of overdue records
 *                         collectionRate:
 *                           type: string
 *                           description: Collection rate as percentage
 *                         byDate:
 *                           type: object
 *                           description: Revenue grouped by date
 *                         byStatus:
 *                           type: object
 *                           description: Revenue grouped by payment status
 *                     records:
 *                       type: array
 *                       description: Detailed billing records with patient information
 */
router.get('/billing-summary', authenticateToken, requireStaff, reportsController.getBillingSummary);

module.exports = router;
