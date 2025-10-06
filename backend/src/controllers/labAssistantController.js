const prisma = require('../config/prisma');

/**
 * Lab Assistant Dashboard Controller
 * Handles sample collection, processing, and lab support tasks
 */

// Get lab assistant dashboard overview
const getLabAssistantDashboard = async (req, res) => {
  try {
    const [
      samplesToCollect,
      samplesCollected,
      samplesProcessing,
      resultsReady,
      recentSamples
    ] = await Promise.all([
      // Samples to collect (test requests without collection record)
      prisma.medical_record.count({
        where: {
          record_type: {
            in: ['Lab Test Requested']
          },
          treatment: {
            not: {
              contains: 'sample_collected'
            }
          }
        }
      }),
      
      // Samples collected today
      prisma.medical_record.count({
        where: {
          record_type: 'Lab Test Requested',
          treatment: {
            contains: 'sample_collected'
          },
          updated_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Samples currently processing
      prisma.medical_record.count({
        where: {
          record_type: 'Lab Test Requested',
          treatment: {
            contains: 'sample_collected'
          },
          diagnosis: {
            not: {
              contains: 'completed'
            }
          }
        }
      }),
      
      // Results ready for review
      prisma.medical_record.count({
        where: {
          record_type: 'Lab Result',
          created_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Recent sample activities
      prisma.medical_record.findMany({
        take: 10,
        orderBy: { updated_at: 'desc' },
        where: {
          record_type: {
            in: ['Lab Test Requested', 'Lab Result']
          }
        },
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              patient_id: true
            }
          }
        }
      })
    ]);

    const dashboardData = {
      overview: {
        samplesToCollect,
        samplesCollected,
        samplesProcessing,
        resultsReady
      },
      recentSamples
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching lab assistant dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab assistant dashboard data'
    });
  }
};

// Get samples to collect
const getSamplesToCollect = async (req, res) => {
  try {
    const { page = 1, limit = 20, priority } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      record_type: 'Lab Test Requested',
      treatment: {
        not: {
          contains: 'sample_collected'
        }
      }
    };

    if (priority) {
      whereClause.diagnosis = {
        contains: priority
      };
    }

    const [samples, total] = await Promise.all([
      prisma.medical_record.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              patient_id: true,
              first_name: true,
              last_name: true,
              date_of_birth: true,
              phone_number: true,
              room_assignments: {
                where: {
                  discharge_date: null
                },
                include: {
                  room: {
                    select: {
                      room_number: true,
                      department: {
                        select: {
                          department_name: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { diagnosis: 'desc' }, // urgent first
          { created_at: 'asc' }
        ],
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.medical_record.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: samples,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching samples to collect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch samples to collect'
    });
  }
};

// Record sample collection
const recordSampleCollection = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { 
      collection_time,
      sample_type,
      collection_method,
      container_type,
      volume_collected,
      notes,
      fasting_status 
    } = req.body;

    // Get the test request
    const testRequest = await prisma.medical_record.findUnique({
      where: { record_id: parseInt(sampleId) }
    });

    if (!testRequest) {
      return res.status(404).json({
        success: false,
        error: 'Test request not found'
      });
    }

    // Update test request with sample collection info
    const updatedRequest = await prisma.medical_record.update({
      where: { record_id: parseInt(sampleId) },
      data: {
        treatment: `${testRequest.treatment} - sample_collected by ${req.user.user_id}`,
        diagnosis: `${testRequest.diagnosis} | Sample: ${sample_type} | Volume: ${volume_collected} | Container: ${container_type} | Fasting: ${fasting_status || 'N/A'}`,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Sample collection recorded successfully'
    });
  } catch (error) {
    console.error('Error recording sample collection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record sample collection'
    });
  }
};

// Get sample processing queue
const getSampleProcessingQueue = async (req, res) => {
  try {
    const { page = 1, limit = 20, test_type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      record_type: 'Lab Test Requested',
      treatment: {
        contains: 'sample_collected'
      },
      diagnosis: {
        not: {
          contains: 'completed'
        }
      }
    };

    if (test_type) {
      whereClause.diagnosis = {
        ...whereClause.diagnosis,
        contains: test_type
      };
    }

    const [samples, total] = await Promise.all([
      prisma.medical_record.findMany({
        where: whereClause,
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              patient_id: true
            }
          }
        },
        orderBy: { updated_at: 'asc' },
        skip: parseInt(offset),
        take: parseInt(limit)
      }),
      prisma.medical_record.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: samples,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching sample processing queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sample processing queue'
    });
  }
};

// Update sample processing status
const updateSampleProcessingStatus = async (req, res) => {
  try {
    const { sampleId } = req.params;
    const { status, processing_notes, quality_check } = req.body;

    const testRequest = await prisma.medical_record.findUnique({
      where: { record_id: parseInt(sampleId) }
    });

    if (!testRequest) {
      return res.status(404).json({
        success: false,
        error: 'Sample not found'
      });
    }

    const updatedRequest = await prisma.medical_record.update({
      where: { record_id: parseInt(sampleId) },
      data: {
        treatment: `${testRequest.treatment} - processing_status: ${status}`,
        diagnosis: `${testRequest.diagnosis} | Processing: ${status} | Quality: ${quality_check || 'OK'} | Notes: ${processing_notes || ''}`,
        updated_at: new Date()
      }
    });

    res.json({
      success: true,
      data: updatedRequest,
      message: 'Sample processing status updated successfully'
    });
  } catch (error) {
    console.error('Error updating sample processing status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update sample processing status'
    });
  }
};

// Get lab inventory (supplies, reagents)
const getLabInventory = async (req, res) => {
  try {
    // Mock inventory data - in real system this would come from inventory management
    const inventory = [
      {
        id: 1,
        item_name: 'Blood Collection Tubes (EDTA)',
        category: 'Collection Supplies',
        current_stock: 150,
        minimum_stock: 50,
        unit: 'pieces',
        supplier: 'MedSupply Co.',
        last_restocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        item_name: 'Chemistry Reagent Kit',
        category: 'Reagents',
        current_stock: 8,
        minimum_stock: 15,
        unit: 'kits',
        supplier: 'Lab Reagents Inc.',
        last_restocked: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        item_name: 'Disposable Pipette Tips',
        category: 'Lab Supplies',
        current_stock: 500,
        minimum_stock: 200,
        unit: 'pieces',
        supplier: 'LabTech Solutions',
        last_restocked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        expiry_date: null
      }
    ];

    // Filter low stock items if requested
    const { low_stock } = req.query;
    let filteredInventory = inventory;
    
    if (low_stock === 'true') {
      filteredInventory = inventory.filter(item => item.current_stock <= item.minimum_stock);
    }

    res.json({
      success: true,
      data: filteredInventory
    });
  } catch (error) {
    console.error('Error fetching lab inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lab inventory'
    });
  }
};

// Request inventory restocking
const requestInventoryRestock = async (req, res) => {
  try {
    const { items, urgency, notes } = req.body;

    // Mock implementation - in real system this would create purchase orders
    const restockRequest = {
      id: Date.now(),
      requested_by: req.user.user_id,
      items,
      urgency,
      notes,
      status: 'pending',
      requested_at: new Date()
    };

    res.json({
      success: true,
      data: restockRequest,
      message: 'Inventory restock request submitted successfully'
    });
  } catch (error) {
    console.error('Error requesting inventory restock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request inventory restock'
    });
  }
};

// Get collection schedule
const getCollectionSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    // Get scheduled sample collections for the day
    const collections = await prisma.medical_record.findMany({
      where: {
        record_type: 'Lab Test Requested',
        created_at: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      },
      include: {
        patient: {
          select: {
            patient_id: true,
            first_name: true,
            last_name: true,
            room_assignments: {
              where: {
                discharge_date: null
              },
              include: {
                room: {
                  select: {
                    room_number: true,
                    department: {
                      select: {
                        department_name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Error fetching collection schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch collection schedule'
    });
  }
};

module.exports = {
  getLabAssistantDashboard,
  getSamplesToCollect,
  recordSampleCollection,
  getSampleProcessingQueue,
  updateSampleProcessingStatus,
  getLabInventory,
  requestInventoryRestock,
  getCollectionSchedule
};