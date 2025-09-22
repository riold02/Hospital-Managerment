const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { validateBilling, validateBillingUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Billing:
 *       type: object
 *       required:
 *         - patient_id
 *         - billing_date
 *         - total_amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated billing ID
 *         patient_id:
 *           type: integer
 *           description: Patient ID
 *         billing_date:
 *           type: string
 *           format: date
 *           description: Billing date
 *         total_amount:
 *           type: number
 *           format: decimal
 *           description: Total amount
 *         payment_status:
 *           type: string
 *           enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *           description: Payment status
 *         payment_date:
 *           type: string
 *           format: date
 *           description: Payment date
 *         payment_method:
 *           type: string
 *           description: Payment method
 *         description:
 *           type: string
 *           description: Billing description
 *         is_active:
 *           type: boolean
 *           description: Whether the billing record is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/billing:
 *   get:
 *     summary: Get all billing records
 *     tags: [Billing]
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
 *         name: payment_status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *         description: Filter by payment status
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
 *         description: List of billing records
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
 *                     $ref: '#/components/schemas/Billing'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, billingController.getAllBilling);

/**
 * @swagger
 * /api/v1/billing:
 *   post:
 *     summary: Create a new billing record
 *     tags: [Billing]
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
 *               - billing_date
 *               - total_amount
 *             properties:
 *               patient_id:
 *                 type: integer
 *               billing_date:
 *                 type: string
 *                 format: date
 *               total_amount:
 *                 type: number
 *                 format: decimal
 *               payment_status:
 *                 type: string
 *                 enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *                 default: PENDING
 *               payment_date:
 *                 type: string
 *                 format: date
 *               payment_method:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Billing record created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireStaff, validateBilling, billingController.createBilling);

/**
 * @swagger
 * /api/v1/billing/stats:
 *   get:
 *     summary: Get billing statistics
 *     tags: [Billing]
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
 *         description: Billing statistics
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
 *                     totalRevenue:
 *                       type: number
 *                     paidAmount:
 *                       type: number
 *                     pendingAmount:
 *                       type: number
 *                     overdueAmount:
 *                       type: number
 *                     totalCount:
 *                       type: integer
 *                     paidCount:
 *                       type: integer
 *                     pendingCount:
 *                       type: integer
 *                     overdueCount:
 *                       type: integer
 */
router.get('/stats', authenticateToken, requireStaff, billingController.getBillingStats);

/**
 * @swagger
 * /api/v1/billing/patient/{patient_id}:
 *   get:
 *     summary: Get patient billing history
 *     tags: [Billing]
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
 *         description: Patient billing history
 */
router.get('/patient/:patient_id', authenticateToken, billingController.getPatientBillingHistory);

/**
 * @swagger
 * /api/v1/billing/{id}:
 *   get:
 *     summary: Get billing record by ID
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Billing record ID
 *     responses:
 *       200:
 *         description: Billing record details
 *       404:
 *         description: Billing record not found
 */
router.get('/:id', authenticateToken, billingController.getBillingById);

/**
 * @swagger
 * /api/v1/billing/{id}:
 *   put:
 *     summary: Update billing record
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Billing record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               total_amount:
 *                 type: number
 *                 format: decimal
 *               payment_status:
 *                 type: string
 *                 enum: [PENDING, PAID, OVERDUE, CANCELLED]
 *               payment_date:
 *                 type: string
 *                 format: date
 *               payment_method:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Billing record updated successfully
 *       404:
 *         description: Billing record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireStaff, validateBillingUpdate, billingController.updateBilling);

/**
 * @swagger
 * /api/v1/billing/{id}:
 *   delete:
 *     summary: Delete billing record
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Billing record ID
 *     responses:
 *       200:
 *         description: Billing record deleted successfully
 *       404:
 *         description: Billing record not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireStaff, billingController.deleteBilling);

module.exports = router;
