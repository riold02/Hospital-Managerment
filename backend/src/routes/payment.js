const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment gateway integration (MOMO, VNPAY)
 */

/**
 * @swagger
 * /api/v1/payment/momo/create:
 *   post:
 *     summary: Create MOMO payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bill_id
 *               - amount
 *             properties:
 *               bill_id:
 *                 type: integer
 *                 description: Billing ID
 *               amount:
 *                 type: number
 *                 description: Payment amount in VND
 *               orderInfo:
 *                 type: string
 *                 description: Order information
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/momo/create', authenticateToken, paymentController.createMomoPayment);

/**
 * @swagger
 * /api/v1/payment/vnpay/create:
 *   post:
 *     summary: Create VNPAY payment
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bill_id
 *               - amount
 *             properties:
 *               bill_id:
 *                 type: integer
 *                 description: Billing ID
 *               amount:
 *                 type: number
 *                 description: Payment amount in VND
 *               orderInfo:
 *                 type: string
 *                 description: Order information
 *               bankCode:
 *                 type: string
 *                 description: Bank code (optional)
 *     responses:
 *       200:
 *         description: Payment URL created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/vnpay/create', authenticateToken, paymentController.createVNPayPayment);

/**
 * @swagger
 * /api/v1/payment/momo/ipn:
 *   post:
 *     summary: MOMO IPN callback (webhook)
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: IPN processed successfully
 */
router.post('/momo/ipn', paymentController.handleMomoIPN);

/**
 * @swagger
 * /api/v1/payment/vnpay/ipn:
 *   get:
 *     summary: VNPAY IPN callback (webhook)
 *     tags: [Payment]
 *     parameters:
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *         description: Transaction reference
 *     responses:
 *       200:
 *         description: IPN processed successfully
 */
router.get('/vnpay/ipn', paymentController.handleVNPayIPN);

/**
 * @swagger
 * /api/v1/payment/status/{transactionCode}:
 *   get:
 *     summary: Get payment transaction status
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction code
 *     responses:
 *       200:
 *         description: Transaction status retrieved
 *       404:
 *         description: Transaction not found
 */
router.get('/status/:transactionCode', authenticateToken, paymentController.getTransactionStatus);

/**
 * @swagger
 * /api/v1/payment/bill/{bill_id}:
 *   get:
 *     summary: Get all transactions for a bill
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bill_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Transactions retrieved
 */
router.get('/bill/:bill_id', authenticateToken, paymentController.getBillTransactions);

module.exports = router;
