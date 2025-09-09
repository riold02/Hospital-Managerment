const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { validateMedicine, validateMedicineUpdate } = require('../middleware/validation');
const { authenticateToken, requireStaff, requireAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       required:
 *         - medicine_name
 *         - medicine_type
 *         - unit_price
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated medicine ID
 *         medicine_name:
 *           type: string
 *           maxLength: 100
 *           description: Medicine name
 *         medicine_type:
 *           type: string
 *           maxLength: 50
 *           description: Medicine type/category
 *         manufacturer:
 *           type: string
 *           maxLength: 100
 *           description: Manufacturer name
 *         unit_price:
 *           type: number
 *           format: decimal
 *           description: Unit price
 *         stock_quantity:
 *           type: integer
 *           description: Stock quantity
 *         expiry_date:
 *           type: string
 *           format: date
 *           description: Expiry date
 *         description:
 *           type: string
 *           description: Medicine description
 *         is_active:
 *           type: boolean
 *           description: Whether the medicine is active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/medicine:
 *   get:
 *     summary: Get all medicines
 *     tags: [Medicine]
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
 *         name: medicine_type
 *         schema:
 *           type: string
 *         description: Filter by medicine type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for medicine name, manufacturer, or description
 *       - in: query
 *         name: expiry_date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter medicines expiring from this date
 *       - in: query
 *         name: expiry_date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter medicines expiring to this date
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Filter medicines with low stock
 *     responses:
 *       200:
 *         description: List of medicines
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
 *                     $ref: '#/components/schemas/Medicine'
 *                 pagination:
 *                   type: object
 */
router.get('/', authenticateToken, medicineController.getAllMedicines);

/**
 * @swagger
 * /api/v1/medicine:
 *   post:
 *     summary: Create a new medicine
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - medicine_name
 *               - medicine_type
 *               - unit_price
 *             properties:
 *               medicine_name:
 *                 type: string
 *                 maxLength: 100
 *               medicine_type:
 *                 type: string
 *                 maxLength: 50
 *               manufacturer:
 *                 type: string
 *                 maxLength: 100
 *               unit_price:
 *                 type: number
 *                 format: decimal
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireStaff, validateMedicine, medicineController.createMedicine);

/**
 * @swagger
 * /api/v1/medicine/stats:
 *   get:
 *     summary: Get medicine statistics
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicine statistics
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
 *                     totalValue:
 *                       type: number
 *                     byType:
 *                       type: object
 *                     lowStock:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *                     expiringSoon:
 *                       type: integer
 */
router.get('/stats', authenticateToken, requireStaff, medicineController.getMedicineStats);

/**
 * @swagger
 * /api/v1/medicine/low-stock:
 *   get:
 *     summary: Get medicines with low stock
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Stock threshold for low stock alert
 *     responses:
 *       200:
 *         description: List of medicines with low stock
 */
router.get('/low-stock', authenticateToken, requireStaff, medicineController.getLowStockMedicines);

/**
 * @swagger
 * /api/v1/medicine/expired:
 *   get:
 *     summary: Get expired medicines
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of expired medicines
 */
router.get('/expired', authenticateToken, requireStaff, medicineController.getExpiredMedicines);

/**
 * @swagger
 * /api/v1/medicine/type/{type}:
 *   get:
 *     summary: Get medicines by type
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine type
 *     responses:
 *       200:
 *         description: List of medicines of specified type
 */
router.get('/type/:type', authenticateToken, medicineController.getMedicinesByType);

/**
 * @swagger
 * /api/v1/medicine/{id}:
 *   get:
 *     summary: Get medicine by ID
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine details
 *       404:
 *         description: Medicine not found
 */
router.get('/:id', authenticateToken, medicineController.getMedicineById);

/**
 * @swagger
 * /api/v1/medicine/{id}:
 *   put:
 *     summary: Update medicine
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               medicine_name:
 *                 type: string
 *                 maxLength: 100
 *               medicine_type:
 *                 type: string
 *                 maxLength: 50
 *               manufacturer:
 *                 type: string
 *                 maxLength: 100
 *               unit_price:
 *                 type: number
 *                 format: decimal
 *               stock_quantity:
 *                 type: integer
 *                 minimum: 0
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *       404:
 *         description: Medicine not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put('/:id', authenticateToken, requireStaff, validateMedicineUpdate, medicineController.updateMedicine);

/**
 * @swagger
 * /api/v1/medicine/{id}:
 *   delete:
 *     summary: Delete medicine
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine deleted successfully
 *       404:
 *         description: Medicine not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', authenticateToken, requireAdmin, medicineController.deleteMedicine);

module.exports = router;
