const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { validatePharmacy } = require('../middleware/validation');
const { authenticateToken, requireStaff, requireRole } = require('../middleware/auth');

// Pharmacist Dashboard Routes
/**
 * @swagger
 * /api/v1/pharmacy/pharmacist/dashboard:
 *   get:
 *     summary: Get pharmacist dashboard overview
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pharmacist dashboard data retrieved successfully
 */
router.get('/pharmacist/dashboard', authenticateToken, requireRole('pharmacist', 'admin'), pharmacyController.getPharmacistDashboard);

/**
 * @swagger
 * /api/v1/pharmacy/prescriptions/pending:
 *   get:
 *     summary: Get pending prescriptions to dispense
 *     tags: [Pharmacy]
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
 *     responses:
 *       200:
 *         description: Pending prescriptions retrieved successfully
 */
router.get('/prescriptions/pending', authenticateToken, requireRole('pharmacist', 'admin'), pharmacyController.getPendingPrescriptions);

/**
 * @swagger
 * /api/v1/pharmacy/inventory:
 *   get:
 *     summary: Get medicine inventory with enhanced filtering
 *     tags: [Pharmacy]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by medicine name
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Filter low stock items
 *     responses:
 *       200:
 *         description: Medicine inventory retrieved successfully
 */
router.get('/inventory', authenticateToken, requireRole('pharmacist', 'admin'), pharmacyController.getMedicineInventory);

/**
 * @swagger
 * /api/v1/pharmacy/medicines/{medicineId}/stock:
 *   put:
 *     summary: Update medicine stock
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medicine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock_quantity:
 *                 type: integer
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               batch_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medicine stock updated successfully
 */
router.put('/medicines/:medicineId/stock', authenticateToken, requireRole('pharmacist', 'admin'), pharmacyController.updateMedicineStock);

/**
 * @swagger
 * /api/v1/pharmacy/medicines/expiring:
 *   get:
 *     summary: Get medicines expiring soon
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Days ahead to check for expiry
 *     responses:
 *       200:
 *         description: Expiring medicines retrieved successfully
 */
router.get('/medicines/expiring', authenticateToken, requireRole('pharmacist', 'admin'), pharmacyController.getExpiringMedicines);

/**
 * @swagger
 * components:
 *   schemas:
 *     Pharmacy:
 *       type: object
 *       required:
 *         - patient_id
 *         - medicine_id
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated pharmacy record ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         medicine_id:
 *           type: integer
 *           description: Medicine ID
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           description: Quantity dispensed
 *         unit_price:
 *           type: number
 *           format: decimal
 *           description: Unit price at time of dispensing
 *         total_price:
 *           type: number
 *           format: decimal
 *           description: Total price
 *         prescription_id:
 *           type: integer
 *           description: Related prescription ID
 *         dispensed_date:
 *           type: string
 *           format: date
 *           description: Date when medicine was dispensed
 *         dispensed_by:
 *           type: integer
 *           description: Staff ID who dispensed the medicine
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/pharmacy:
 *   get:
 *     summary: Get all pharmacy records
 *     tags: [Pharmacy]
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
 *         name: medicine_id
 *         schema:
 *           type: integer
 *         description: Filter by medicine ID
 *       - in: query
 *         name: dispensed_by
 *         schema:
 *           type: integer
 *         description: Filter by staff who dispensed
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
 *         description: List of pharmacy records
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
 *                     $ref: '#/components/schemas/Pharmacy'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, requireStaff, pharmacyController.getAllPharmacyRecords);

/**
 * @swagger
 * /api/v1/pharmacy:
 *   post:
 *     summary: Dispense medicine to patient
 *     tags: [Pharmacy]
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
 *               - medicine_id
 *               - quantity
 *             properties:
 *               patient_id:
 *                 type: integer
 *               medicine_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *               prescription_id:
 *                 type: integer
 *                 description: Optional prescription reference
 *     responses:
 *       201:
 *         description: Medicine dispensed successfully
 *       400:
 *         description: Bad request or insufficient stock
 *       404:
 *         description: Medicine not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireStaff, validatePharmacy, pharmacyController.dispenseMedicine);

/**
 * @swagger
 * /api/v1/pharmacy/stats:
 *   get:
 *     summary: Get pharmacy statistics
 *     tags: [Pharmacy]
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
 *         description: Pharmacy statistics
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
 *                     totalDispensed:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     totalTransactions:
 *                       type: integer
 *                     byMedicine:
 *                       type: object
 */
router.get('/stats', authenticateToken, requireStaff, pharmacyController.getPharmacyStats);

/**
 * @swagger
 * /api/v1/pharmacy/daily-report:
 *   get:
 *     summary: Get daily dispensing report
 *     tags: [Pharmacy]
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
 *         description: Daily dispensing report
 */
router.get('/daily-report', authenticateToken, requireStaff, pharmacyController.getDailyDispensingReport);

/**
 * @swagger
 * /api/v1/pharmacy/patient/{patient_id}:
 *   get:
 *     summary: Get patient's pharmacy history
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Patient's pharmacy history
 */
router.get('/patient/:patient_id', authenticateToken, pharmacyController.getPatientPharmacyHistory);

/**
 * @swagger
 * /api/v1/pharmacy/medicine/{medicine_id}:
 *   get:
 *     summary: Get medicine dispensing history
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medicine_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine dispensing history
 */
router.get('/medicine/:medicine_id', authenticateToken, requireStaff, pharmacyController.getMedicineDispensingHistory);

/**
 * @swagger
 * /api/v1/pharmacy/{id}:
 *   get:
 *     summary: Get pharmacy record by ID
 *     tags: [Pharmacy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pharmacy record ID
 *     responses:
 *       200:
 *         description: Pharmacy record details
 *       404:
 *         description: Pharmacy record not found
 */
router.get('/:id', authenticateToken, pharmacyController.getPharmacyRecordById);

module.exports = router;
