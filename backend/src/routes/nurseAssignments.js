const express = require('express');
const router = express.Router();
const nurseAssignmentController = require('../controllers/nurseAssignmentController');
const { authenticateToken, checkRole } = require('../middleware/auth');

/**
 * Nurse Patient Assignment Routes
 * Base path: /api/v1/nurse-assignments
 */

// ============================================================================
// NURSE ROUTES - View their own assigned patients
// ============================================================================

/**
 * @swagger
 * /api/v1/nurse-assignments/my-patients:
 *   get:
 *     summary: Get my assigned patients (Nurse)
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patients assigned to current nurse
 */
router.get(
  '/my-patients',
  authenticateToken,
  nurseAssignmentController.getMyAssignedPatients
);

// ============================================================================
// ADMIN/HEAD NURSE ROUTES - Manage all assignments
// ============================================================================

/**
 * @swagger
 * /api/v1/nurse-assignments:
 *   get:
 *     summary: Get all nurse-patient assignments (Admin/Head Nurse)
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled, transferred]
 *       - in: query
 *         name: nurse_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: patient_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: shift_type
 *         schema:
 *           type: string
 *           enum: [morning, afternoon, night, all_day]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [normal, high, critical]
 *     responses:
 *       200:
 *         description: List of all nurse-patient assignments
 */
router.get(
  '/',
  authenticateToken,
  nurseAssignmentController.getAllAssignments
);

/**
 * @swagger
 * /api/v1/nurse-assignments/available-nurses:
 *   get:
 *     summary: Get available nurses for assignment
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available nurses with workload info
 */
router.get(
  '/available-nurses',
  authenticateToken,
  nurseAssignmentController.getAvailableNurses
);

/**
 * @swagger
 * /api/v1/nurse-assignments:
 *   post:
 *     summary: Assign nurse to patient (Admin/Head Nurse)
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nurse_id
 *               - patient_id
 *             properties:
 *               nurse_id:
 *                 type: integer
 *               patient_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               shift_type:
 *                 type: string
 *                 enum: [morning, afternoon, night, all_day]
 *               priority:
 *                 type: string
 *                 enum: [normal, high, critical]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nurse assigned successfully
 */
router.post(
  '/',
  authenticateToken,
  nurseAssignmentController.assignNurseToPatient
);

/**
 * @swagger
 * /api/v1/nurse-assignments/{id}:
 *   patch:
 *     summary: Update assignment (Admin/Head Nurse)
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               end_date:
 *                 type: string
 *                 format: date
 *               shift_type:
 *                 type: string
 *               priority:
 *                 type: string
 *               notes:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 */
router.patch(
  '/:id',
  authenticateToken,
  nurseAssignmentController.updateAssignment
);

/**
 * @swagger
 * /api/v1/nurse-assignments/{id}/end:
 *   patch:
 *     summary: End assignment (mark as completed)
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignment ended successfully
 */
router.patch(
  '/:id/end',
  authenticateToken,
  nurseAssignmentController.endAssignment
);

/**
 * @swagger
 * /api/v1/nurse-assignments/{id}:
 *   delete:
 *     summary: Delete assignment (Admin only)
 *     tags: [Nurse Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 */
router.delete(
  '/:id',
  authenticateToken,
  nurseAssignmentController.deleteAssignment
);

module.exports = router;
