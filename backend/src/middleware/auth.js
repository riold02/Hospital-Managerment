const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');

// ============================================================================
// UNIFIED AUTH MIDDLEWARE - RBAC + Legacy Support
// ============================================================================

/**
 * Main authentication middleware with full RBAC support
 * Supports both legacy and new RBAC systems
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database with full RBAC data
    const user = await prisma.users.findUnique({
      where: { 
        user_id: decoded.user_id || decoded.id,
        is_active: true 
      },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        },
        patient: {
          select: {
            patient_id: true,
            first_name: true,
            last_name: true
          }
        },
        staff_member: {
          select: {
            staff_id: true,
            first_name: true,
            last_name: true,
            role: true,
            position: true,
            department_id: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }

    // Build permissions array
    const permissions = [];
    const roles = [];
    
    user.user_roles.forEach(userRole => {
      roles.push(userRole.role.role_name);
      userRole.role.role_permissions.forEach(rolePermission => {
        const perm = `${rolePermission.permission.resource}:${rolePermission.permission.action}`;
        if (!permissions.includes(perm)) {
          permissions.push(perm);
        }
      });
    });

    const primaryRole = roles[0] || 'patient';
    const userType = user.patient ? 'patient' : 'staff';

    // Build comprehensive user object
    req.user = {
      // Core identifiers
      id: user.user_id,
      user_id: user.user_id,
      email: user.email,
      
      // Legacy compatibility
      role: primaryRole.toUpperCase(),
      type: userType,
      
      // RBAC data
      roles: roles,
      permissions: permissions,
      
      // Related data
      patient_id: user.patient?.patient_id || null,
      staff_id: user.staff_member?.staff_id || null,
      department_id: user.staff_member?.department_id || null,
      
      // Profile information
      profile: {
        first_name: user.patient?.first_name || user.staff_member?.first_name,
        last_name: user.patient?.last_name || user.staff_member?.last_name,
        position: user.staff_member?.position || null,
        staff_role: user.staff_member?.role || null
      }
    };

    // Update last login
    await prisma.users.update({
      where: { user_id: user.user_id },
      data: { last_login: new Date() }
    });

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userRoles = req.user.roles || [];
    const hasRole = roles.some(role => 
      userRoles.includes(role.toLowerCase()) || 
      userRoles.includes(role.toUpperCase()) ||
      req.user.role === role.toUpperCase()
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user is patient
const requirePatient = (req, res, next) => {
  if (!req.user || req.user.type !== 'patient') {
    return res.status(403).json({
      success: false,
      error: 'Patient access required'
    });
  }
  next();
};

// Check if user is staff
const requireStaff = (req, res, next) => {
  if (!req.user || req.user.type !== 'staff') {
    return res.status(403).json({
      success: false,
      error: 'Staff access required'
    });
  }
  next();
};

// Check if user is doctor
const requireDoctor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const userRoles = req.user.roles || [];
  const isDoctor = userRoles.includes('doctor') || userRoles.includes('admin') || 
                   ['DOCTOR', 'ADMIN'].includes(req.user.role);

  if (!isDoctor) {
    return res.status(403).json({
      success: false,
      error: 'Doctor access required'
    });
  }
  next();
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const userRoles = req.user.roles || [];
  const isAdmin = userRoles.includes('admin') || req.user.role === 'ADMIN';

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.users.findUnique({
      where: { 
        user_id: decoded.user_id || decoded.id,
        is_active: true 
      },
      include: {
        user_roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (user) {
      const roles = user.user_roles.map(ur => ur.role.role_name);
      req.user = {
        id: user.user_id,
        user_id: user.user_id,
        email: user.email,
        role: roles[0]?.toUpperCase() || 'PATIENT',
        roles: roles
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user context
    next();
  }
};

// ============================================================================
// RBAC FUNCTIONS - Permission-based access control
// ============================================================================

/**
 * Check if user has required permission(s)
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasRequiredPermission = permissions.some(perm => userPermissions.includes(perm));

    if (!hasRequiredPermission) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required permissions: ${permissions.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Check if user has permission for specific resource and action
 */
const requireResourcePermission = (resource, action) => {
  return requirePermission(`${resource}:${action}`);
};

/**
 * Check if user is medical staff (doctor, nurse, admin)
 */
const requireMedicalStaff = requireRole('doctor', 'nurse', 'admin');

/**
 * Check if user is healthcare staff (doctor, nurse, pharmacist, technician, admin)
 */
const requireHealthcareStaff = requireRole('doctor', 'nurse', 'pharmacist', 'technician', 'admin');

/**
 * Check if user is patient or can access patient data
 */
const requirePatientAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const userRoles = req.user.roles || [];
  const resourcePatientId = req.params.patient_id || req.body.patient_id;
  const userPatientId = req.user.patient_id;

  // Staff can access any patient data if they have permission
  if (userRoles.some(role => ['admin', 'doctor', 'nurse', 'pharmacist'].includes(role))) {
    return next();
  }

  // Patients can only access their own data
  if (userRoles.includes('patient') && userPatientId && resourcePatientId) {
    if (parseInt(userPatientId) === parseInt(resourcePatientId)) {
      return next();
    }
  }

  return res.status(403).json({
    success: false,
    error: 'Access denied - insufficient permissions for patient data'
  });
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has any of the specified roles
 */
const hasRole = (user, ...roles) => {
  if (!user || !user.roles) return false;
  return roles.some(role => user.roles.includes(role.toLowerCase()));
};

/**
 * Check if user has specific permission
 */
const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

/**
 * Check if user can access resource
 */
const canAccessResource = (user, resource, action) => {
  return hasPermission(user, `${resource}:${action}`);
};

/**
 * Get user's full name
 */
const getUserFullName = (user) => {
  if (!user || !user.profile) return 'Unknown User';
  const { first_name, last_name } = user.profile;
  return `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown User';
};

/**
 * Check if user is admin
 */
const isAdmin = (user) => {
  return hasRole(user, 'admin') || user.role === 'ADMIN';
};

/**
 * Check if user is patient
 */
const isPatient = (user) => {
  return user?.type === 'patient' || hasRole(user, 'patient');
};

/**
 * Check if user is staff
 */
const isStaff = (user) => {
  return user?.type === 'staff' || !hasRole(user, 'patient');
};

module.exports = {
  // ============================================================================
  // MAIN AUTHENTICATION
  // ============================================================================
  authenticateToken,
  optionalAuth,

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL
  // ============================================================================
  requireRole,
  requirePermission,
  requireResourcePermission,

  // ============================================================================
  // SPECIFIC ROLE REQUIREMENTS
  // ============================================================================
  requireAdmin,
  requireDoctor,
  requireMedicalStaff,
  requireHealthcareStaff,
  requirePatient,
  requireStaff,
  requirePatientAccess,

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  hasRole,
  hasPermission,
  canAccessResource,
  getUserFullName,
  isAdmin,
  isPatient,
  isStaff
};
