const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireStaff } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardKPIs:
 *       type: object
 *       properties:
 *         todayAppointments:
 *           type: integer
 *           description: Number of appointments today
 *         roomOccupancy:
 *           type: integer
 *           description: Room occupancy percentage
 *         monthlyRevenue:
 *           type: number
 *           description: Monthly revenue
 *         expiringMedicine:
 *           type: integer
 *           description: Number of medicines expiring within 30 days
 */

/**
 * @swagger
 * /api/v1/dashboard/kpis:
 *   get:
 *     summary: Get dashboard KPIs
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard KPIs data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardKPIs'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 */
router.get('/kpis', authenticateToken, requireStaff, dashboardController.getDashboardKPIs);

/**
 * @swagger
 * /api/v1/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
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
 *                     recentAppointments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recentBilling:
 *                       type: array
 *                       items:
 *                         type: object
 *                     alerts:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 */
router.get('/overview', authenticateToken, requireStaff, dashboardController.getDashboardOverview);

module.exports = router;
