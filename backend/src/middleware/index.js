// ============================================================================
// MIDDLEWARE INDEX - Export all middleware functions
// Unified auth middleware with full RBAC support
// ============================================================================

// Unified auth middleware (includes RBAC)
const authMiddleware = require('./auth');

// Validation middleware
const validationMiddleware = require('./validation');

// Export all middleware
module.exports = {
  // Main auth middleware
  auth: authMiddleware,
  
  // Validation
  validation: validationMiddleware,
  
  // ============================================================================
  // AUTHENTICATION
  // ============================================================================
  authenticateToken: authMiddleware.authenticateToken,
  optionalAuth: authMiddleware.optionalAuth,
  
  // ============================================================================
  // ROLE-BASED ACCESS CONTROL
  // ============================================================================
  requireRole: authMiddleware.requireRole,
  requirePermission: authMiddleware.requirePermission,
  requireResourcePermission: authMiddleware.requireResourcePermission,
  
  // ============================================================================
  // SPECIFIC ROLE REQUIREMENTS
  // ============================================================================
  requireAdmin: authMiddleware.requireAdmin,
  requireDoctor: authMiddleware.requireDoctor,
  requireMedicalStaff: authMiddleware.requireMedicalStaff,
  requireHealthcareStaff: authMiddleware.requireHealthcareStaff,
  requirePatient: authMiddleware.requirePatient,
  requireStaff: authMiddleware.requireStaff,
  requirePatientAccess: authMiddleware.requirePatientAccess,
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  hasRole: authMiddleware.hasRole,
  hasPermission: authMiddleware.hasPermission,
  canAccessResource: authMiddleware.canAccessResource,
  getUserFullName: authMiddleware.getUserFullName,
  isAdmin: authMiddleware.isAdmin,
  isPatient: authMiddleware.isPatient,
  isStaff: authMiddleware.isStaff
};
