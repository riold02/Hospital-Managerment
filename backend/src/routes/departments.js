const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { validateDepartment, validateDoctorDepartment } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       required:
 *         - department_name
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated department ID
 *         department_name:
 *           type: string
 *           maxLength: 100
 *           description: Department name
 *         description:
 *           type: string
 *           description: Department description
 *         is_active:
 *           type: boolean
 *           description: Whether the department is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for department name or description
 *     responses:
 *       200:
 *         description: List of departments
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
 *                     $ref: '#/components/schemas/Department'
 *                 pagination:
 *                   type: object
 */
router.get('/', departmentController.getAllDepartments);

/**
 * @swagger
 * /api/v1/departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - department_name
 *             properties:
 *               department_name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireAdmin, validateDepartment, departmentController.createDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details with staff and doctors
 *       404:
 *         description: Department not found
 */
router.get('/:id', departmentController.getDepartmentById);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               department_name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Department updated successfully
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireAdmin, validateDepartment, departmentController.updateDepartment);

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
 *       400:
 *         description: Cannot delete department with active staff or doctors
 *       404:
 *         description: Department not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireAdmin, departmentController.deleteDepartment);

/**
 * @swagger
 * /api/v1/departments/doctor-assignment:
 *   post:
 *     summary: Assign doctor to department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - department_id
 *             properties:
 *               doctor_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Doctor assigned to department successfully
 *       409:
 *         description: Doctor is already assigned to this department
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/doctor-assignment', authenticateToken, requireAdmin, validateDoctorDepartment, departmentController.assignDoctorToDepartment);

/**
 * @swagger
 * /api/v1/departments/doctor-assignment:
 *   delete:
 *     summary: Remove doctor from department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doctor_id
 *               - department_id
 *             properties:
 *               doctor_id:
 *                 type: integer
 *               department_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Doctor removed from department successfully
 *       404:
 *         description: Doctor assignment not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/doctor-assignment', authenticateToken, requireAdmin, validateDoctorDepartment, departmentController.removeDoctorFromDepartment);

module.exports = router;
