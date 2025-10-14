const { prisma } = require('../config/prisma');

/**
 * Get all services
 * @route GET /api/v1/services
 */
const getAllServices = async (req, res) => {
  try {
    const { category, is_active = 'true', limit = 100 } = req.query;

    const where = {};
    if (category) {
      where.category = category;
    }
    if (is_active !== 'all') {
      where.is_active = is_active === 'true';
    }

    const services = await prisma.services.findMany({
      where,
      take: parseInt(limit),
      orderBy: [
        { category: 'asc' },
        { service_name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: services,
      total: services.length
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
};

/**
 * Get service by ID
 * @route GET /api/v1/services/:id
 */
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await prisma.services.findUnique({
      where: { service_id: parseInt(id) }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service'
    });
  }
};

/**
 * Get services by category
 * @route GET /api/v1/services/category/:category
 */
const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const services = await prisma.services.findMany({
      where: {
        category,
        is_active: true
      },
      orderBy: { service_name: 'asc' }
    });

    res.json({
      success: true,
      data: services,
      total: services.length
    });
  } catch (error) {
    console.error('Error fetching services by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services'
    });
  }
};

/**
 * Get all service categories
 * @route GET /api/v1/services/categories
 */
const getServiceCategories = async (req, res) => {
  try {
    const categories = await prisma.$queryRaw`
      SELECT DISTINCT category, COUNT(*) as service_count
      FROM services
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `;

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

/**
 * Create new service (Admin only)
 * @route POST /api/v1/services
 */
const createService = async (req, res) => {
  try {
    const {
      service_name,
      service_code,
      description,
      category,
      unit_price,
      unit,
      is_active,
      requires_doctor,
      estimated_duration
    } = req.body;

    const service = await prisma.services.create({
      data: {
        service_name,
        service_code,
        description,
        category,
        unit_price,
        unit,
        is_active,
        requires_doctor,
        estimated_duration
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        error: 'Service code already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create service'
    });
  }
};

/**
 * Update service (Admin only)
 * @route PUT /api/v1/services/:id
 */
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const service = await prisma.services.update({
      where: { service_id: parseInt(id) },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to update service'
    });
  }
};

/**
 * Delete service (Admin only)
 * @route DELETE /api/v1/services/:id
 */
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to false
    await prisma.services.update({
      where: { service_id: parseInt(id) },
      data: { is_active: false }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to delete service'
    });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  getServicesByCategory,
  getServiceCategories,
  createService,
  updateService,
  deleteService
};
