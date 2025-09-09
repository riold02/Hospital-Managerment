const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { validateStaff, validateStaffUpdate, validateNurse, validateWorker } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Staff:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated staff ID
 *         first_name:
 *           type: string
 *           maxLength: 50
 *           description: Staff first name
 *         last_name:
 *           type: string
 *           maxLength: 50
 *           description: Staff last name
 *         email:
 *           type: string
 *           format: email
 *           description: Staff email address
 *         role:
 *           type: string
 *           enum: [DOCTOR, NURSE, STAFF, ADMIN]
 *           description: Staff role
 *         position:
 *           type: string
 *           description: Staff position
 *         department_id:
 *           type: integer
 *           description: Department ID
 *         contact_number:
 *           type: string
 *           maxLength: 15
 *           description: Contact number
 *         is_active:
 *           type: boolean
 *           description: Whether the staff is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/staff:
 *   get:
 *     summary: Get all staff members
 *     tags: [Staff]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [DOCTOR, NURSE, STAFF, ADMIN]
 *         description: Filter by role
 *       - in: query
 *         name: department_id
 *         schema:
 *           type: integer
 *         description: Filter by department ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, or position
 *     responses:
 *       200:
 *         description: List of staff members
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
 *                     $ref: '#/components/schemas/Staff'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, staffController.getAllStaff);

/**
 * @swagger
 * /api/v1/staff:
 *   post:
 *     summary: Create a new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - role
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
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [DOCTOR, NURSE, STAFF, ADMIN]
 *               position:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               contact_number:
 *                 type: string
 *                 maxLength: 15
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Staff with email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireAdmin, validateStaff, staffController.createStaff);

/**
 * @swagger
 * /api/v1/staff/stats:
 *   get:
 *     summary: Get staff statistics
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff statistics
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
 *                     byRole:
 *                       type: object
 *                     byDepartment:
 *                       type: object
 */
router.get('/stats', authenticateToken, staffController.getStaffStats);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff member details
 *       404:
 *         description: Staff member not found
 */
router.get('/:id', authenticateToken, staffController.getStaffById);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
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
 *               password:
 *                 type: string
 *                 minLength: 6
 *               role:
 *                 type: string
 *                 enum: [DOCTOR, NURSE, STAFF, ADMIN]
 *               position:
 *                 type: string
 *               department_id:
 *                 type: integer
 *               contact_number:
 *                 type: string
 *                 maxLength: 15
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *       404:
 *         description: Staff member not found
 *       409:
 *         description: Staff with email already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireAdmin, validateStaffUpdate, staffController.updateStaff);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   delete:
 *     summary: Delete staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Staff ID
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *       404:
 *         description: Staff member not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireAdmin, staffController.deleteStaff);

module.exports = router;
