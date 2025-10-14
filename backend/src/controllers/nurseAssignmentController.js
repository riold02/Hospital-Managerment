const { prisma } = require('../config/prisma');

/**
 * Nurse Patient Assignment Controller
 * Manages assignment of nurses to patients for care responsibility
 */

// Get all nurse-patient assignments (Admin/Head Nurse)
const getAllAssignments = async (req, res) => {
  try {
    const { status, nurse_id, patient_id, shift_type, priority } = req.query;

    const where = {};
    if (status) where.status = status;
    if (nurse_id) where.nurse_id = parseInt(nurse_id);
    if (patient_id) where.patient_id = parseInt(patient_id);
    if (shift_type) where.shift_type = shift_type;
    if (priority) where.priority = priority;

    const assignments = await prisma.nurse_patient_assignments.findMany({
      where,
      include: {
        nurse: {
          select: {
            staff_id: true,
            first_name: true,
            last_name: true,
            role: true,
            phone: true,
            email: true
          }
        },
        patient: {
          select: {
            patient_id: true,
            patient_code: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            gender: true,
            phone: true,
            email: true,
            blood_type: true,
            allergies: true,
            medical_history: true,
            room_assignments: {
              where: { end_date: null },
              include: {
                room: {
                  select: {
                    room_number: true,
                    room_type_id: true
                  }
                }
              }
            }
          }
        },
        assigned_by_user: {
          select: {
            user_id: true,
            email: true,
            staff_member: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { start_date: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching nurse assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch nurse assignments'
    });
  }
};

// Get assignments for a specific nurse (My Assigned Patients)
const getMyAssignedPatients = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get nurse's staff_id from user_id
    const staff = await prisma.staff.findUnique({
      where: { user_id: userId }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        error: 'Staff record not found'
      });
    }

    const assignments = await prisma.nurse_patient_assignments.findMany({
      where: {
        nurse_id: staff.staff_id,
        status: 'active'
      },
      include: {
        patient: {
          include: {
            medical_records: {
              orderBy: { created_at: 'desc' },
              take: 3,
              select: {
                medical_record_id: true,
                diagnosis: true,
                treatment: true,
                created_at: true,
                doctor: {
                  select: {
                    first_name: true,
                    last_name: true,
                    specialty: true
                  }
                }
              }
            },
            room_assignments: {
              where: { end_date: null },
              include: {
                room: {
                  select: {
                    room_id: true,
                    room_number: true,
                    capacity: true,
                    status: true,
                    room_type: {
                      select: {
                        type_name: true
                      }
                    }
                  }
                }
              }
            },
            prescriptions: {
              where: {
                created_at: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
              },
              orderBy: { created_at: 'desc' },
              take: 5
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { start_date: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching my assigned patients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assigned patients'
    });
  }
};

// Assign nurse to patient (Admin/Head Nurse)
const assignNurseToPatient = async (req, res) => {
  try {
    const {
      nurse_id,
      patient_id,
      start_date,
      end_date,
      shift_type,
      priority,
      notes
    } = req.body;

    // Validation
    if (!nurse_id || !patient_id) {
      return res.status(400).json({
        success: false,
        error: 'Nurse ID and Patient ID are required'
      });
    }

    // Check if nurse exists
    const nurse = await prisma.staff.findUnique({
      where: { staff_id: parseInt(nurse_id) }
    });

    if (!nurse) {
      return res.status(404).json({
        success: false,
        error: 'Nurse not found'
      });
    }

    // Check if patient exists
    const patient = await prisma.patients.findUnique({
      where: { patient_id: parseInt(patient_id) }
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Check for overlapping active assignments
    const existingAssignment = await prisma.nurse_patient_assignments.findFirst({
      where: {
        nurse_id: parseInt(nurse_id),
        patient_id: parseInt(patient_id),
        status: 'active'
      }
    });

    if (existingAssignment) {
      return res.status(409).json({
        success: false,
        error: 'This nurse is already assigned to this patient'
      });
    }

    // Create assignment
    const assignment = await prisma.nurse_patient_assignments.create({
      data: {
        nurse_id: parseInt(nurse_id),
        patient_id: parseInt(patient_id),
        assigned_by_user_id: req.user.user_id,
        start_date: start_date ? new Date(start_date) : new Date(),
        end_date: end_date ? new Date(end_date) : null,
        shift_type: shift_type || 'all_day',
        priority: priority || 'normal',
        notes,
        status: 'active'
      },
      include: {
        nurse: {
          select: {
            first_name: true,
            last_name: true,
            role: true
          }
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            patient_code: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: assignment,
      message: 'Nurse assigned to patient successfully'
    });
  } catch (error) {
    console.error('Error assigning nurse to patient:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign nurse to patient'
    });
  }
};

// Update assignment
const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { end_date, shift_type, priority, notes, status } = req.body;

    const assignment = await prisma.nurse_patient_assignments.findUnique({
      where: { assignment_id: parseInt(id) }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const updateData = {};
    if (end_date !== undefined) updateData.end_date = end_date ? new Date(end_date) : null;
    if (shift_type) updateData.shift_type = shift_type;
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const updatedAssignment = await prisma.nurse_patient_assignments.update({
      where: { assignment_id: parseInt(id) },
      data: updateData,
      include: {
        nurse: {
          select: {
            first_name: true,
            last_name: true,
            role: true
          }
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            patient_code: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
    });
  }
};

// End assignment (mark as completed)
const endAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const assignment = await prisma.nurse_patient_assignments.findUnique({
      where: { assignment_id: parseInt(id) }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const updatedAssignment = await prisma.nurse_patient_assignments.update({
      where: { assignment_id: parseInt(id) },
      data: {
        end_date: new Date(),
        status: 'completed',
        notes: notes || assignment.notes
      },
      include: {
        nurse: {
          select: {
            first_name: true,
            last_name: true
          }
        },
        patient: {
          select: {
            first_name: true,
            last_name: true,
            patient_code: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedAssignment,
      message: 'Assignment ended successfully'
    });
  } catch (error) {
    console.error('Error ending assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end assignment'
    });
  }
};

// Delete assignment
const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.nurse_patient_assignments.findUnique({
      where: { assignment_id: parseInt(id) }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    await prisma.nurse_patient_assignments.delete({
      where: { assignment_id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete assignment'
    });
  }
};

// Get available nurses for assignment
const getAvailableNurses = async (req, res) => {
  try {
    const { shift_type } = req.query;

    // Get all nurses
    const nurses = await prisma.staff.findMany({
      where: {
        role: {
          in: ['nurse', 'head_nurse', 'NURSE', 'HEAD_NURSE']
        }
      },
      select: {
        staff_id: true,
        first_name: true,
        last_name: true,
        role: true,
        phone: true,
        email: true,
        nurse_patient_assignments: {
          where: { status: 'active' },
          select: {
            assignment_id: true,
            patient: {
              select: {
                patient_id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    // Calculate workload
    const nursesWithWorkload = nurses.map(nurse => ({
      ...nurse,
      current_patient_count: nurse.nurse_patient_assignments.length,
      is_available: nurse.nurse_patient_assignments.length < 10 // Max 10 patients per nurse
    }));

    res.json({
      success: true,
      data: nursesWithWorkload
    });
  } catch (error) {
    console.error('Error fetching available nurses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available nurses'
    });
  }
};

module.exports = {
  getAllAssignments,
  getMyAssignedPatients,
  assignNurseToPatient,
  updateAssignment,
  endAssignment,
  deleteAssignment,
  getAvailableNurses
};
