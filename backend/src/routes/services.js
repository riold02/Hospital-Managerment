const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const { authenticateToken } = require('../middleware/auth');

// Public routes - get services
router.get('/', authenticateToken, servicesController.getAllServices);
router.get('/categories', authenticateToken, servicesController.getServiceCategories);
router.get('/category/:category', authenticateToken, servicesController.getServicesByCategory);
router.get('/:id', authenticateToken, servicesController.getServiceById);

// Admin only routes
router.post('/', authenticateToken, servicesController.createService);
router.put('/:id', authenticateToken, servicesController.updateService);
router.delete('/:id', authenticateToken, servicesController.deleteService);

module.exports = router;
