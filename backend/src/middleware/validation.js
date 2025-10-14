const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss');

// Enhanced validation middleware with XSS protection
const createSecureValidator = (field, options = {}) => {
  let validator = body(field);
  
  // Apply common security sanitization
  validator = validator.customSanitizer((value) => {
    if (value === null || value === undefined) {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remove XSS attempts
      value = xss(value, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style']
      });
      
      // Trim whitespace
      value = value.trim();
      
      // Remove null bytes and other dangerous characters
      value = value.replace(/\0/g, '');
    }
    return value;
  });
  
  // Apply specific validations
  if (options.required) {
    validator = validator.notEmpty().withMessage(`${field} is required`);
  } else {
    validator = validator.optional();
  }
  
  if (options.maxLength) {
    validator = validator.isLength({ max: options.maxLength })
      .withMessage(`${field} must not exceed ${options.maxLength} characters`);
  }
  
  if (options.minLength) {
    validator = validator.isLength({ min: options.minLength })
      .withMessage(`${field} must be at least ${options.minLength} characters`);
  }
  
  if (options.isEmail) {
    validator = validator.isEmail().withMessage('Valid email is required')
      .normalizeEmail({
        gmail_lowercase: true,
        gmail_remove_dots: false,
        outlookdotcom_lowercase: true,
        yahoo_lowercase: true,
        icloud_lowercase: true
      });
  }
  
  if (options.isInt) {
    validator = validator.isInt(options.isInt).withMessage('Valid integer is required');
  }
  
  if (options.isFloat) {
    validator = validator.isFloat(options.isFloat).withMessage('Valid number is required');
  }
  
  if (options.matches) {
    validator = validator.matches(options.matches).withMessage(options.matchesMessage || 'Invalid format');
  }
  
  if (options.isIn) {
    validator = validator.isIn(options.isIn).withMessage(`${field} must be one of: ${options.isIn.join(', ')}`);
  }
  
  if (options.custom) {
    validator = validator.custom(options.custom);
  }
  
  return validator;
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures for security monitoring
    console.log('[SECURITY-VALIDATION]', {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      errors: errors.array(),
      userId: req.user?.id
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: typeof err.value === 'string' && err.value.length > 100 
          ? err.value.substring(0, 100) + '...' 
          : err.value
      }))
    });
  }
  next();
};

// Patient validation rules
const validatePatient = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),
  
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),
  
  body('date_of_birth')
    .isISO8601()
    .withMessage('Valid date of birth is required (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
      
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters')
    .trim(),
  
  body('medical_history')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Medical history must not exceed 2000 characters')
    .trim()
];

// Patient update validation (all fields optional)
const validatePatientUpdate = [
  body('first_name')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),
  
  body('last_name')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
      
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters')
    .trim(),
  
  body('medical_history')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Medical history must not exceed 2000 characters')
    .trim()
];

// Doctor validation rules
const validateDoctor = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),
  
  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),
  
  body('specialty')
    .notEmpty()
    .withMessage('Specialty is required')
    .isLength({ max: 100 })
    .withMessage('Specialty must not exceed 100 characters')
    .trim(),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),
  
  body('available_schedule')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Available schedule must not exceed 1000 characters')
    .trim()
];

// Appointment validation rules
const validateAppointment = [
  // patient_id is extracted from JWT token, not from request body
  
  body('doctor_id')
    .isInt({ min: 1 })
    .withMessage('Valid doctor ID is required'),
  
  body('appointment_date')
    .isISO8601()
    .withMessage('Valid appointment date is required (YYYY-MM-DD)')
    .custom((value) => {
      // Create date objects in a timezone-neutral way
      const [year, month, day] = value.split('-').map(Number);
      const appointmentDate = new Date(year, month - 1, day); // month is 0-indexed
      
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Allow appointments from today onwards
      if (appointmentDate < todayStart) {
        console.log('Date validation failed:', {
          appointmentDate: appointmentDate.toISOString(),
          todayStart: todayStart.toISOString(),
          raw: value
        });
        throw new Error('Appointment date cannot be in the past');
      }
      
      // Don't allow appointments more than 3 months in advance
      const maxDate = new Date(today);
      maxDate.setMonth(maxDate.getMonth() + 3);
      if (appointmentDate > maxDate) {
        throw new Error('Appointment cannot be scheduled more than 3 months in advance');
      }
      
      return true;
    }),
  
  body('appointment_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid appointment time is required (HH:MM format)')
    .custom((value) => {
      const [hours, minutes] = value.split(':').map(Number);
      
      // Only allow appointments during business hours (8:00 AM to 5:00 PM inclusive)
      if (hours < 8 || hours > 17) {
        throw new Error('Appointments are only available between 8:00 AM and 5:00 PM');
      }
      
      // Only allow appointments at 30-minute intervals
      if (minutes !== 0 && minutes !== 30) {
        throw new Error('Appointments must be scheduled at 30-minute intervals (e.g., 9:00, 9:30)');
      }
      
      return true;
    }),
  
  body('purpose')
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Purpose must be between 5 and 500 characters')
    .trim(),
  
  // body('status')
  //   .optional()
  //   .custom((value) => {
  //     if (!value) return true; // optional field
  //     const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  //     const normalizedValue = value.toLowerCase().replace(/\s+/g, '_');
  //     if (!validStatuses.includes(normalizedValue)) {
  //       throw new Error('Status must be one of: Scheduled, Confirmed, In Progress, Completed, Cancelled, No Show');
  //     }
  //     return true;
  //   })
];

// Doctor update validation (all fields optional)
const validateDoctorUpdate = [
  body('first_name')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),

  body('last_name')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),

  body('specialty')
    .optional()
    .notEmpty()
    .withMessage('Specialty cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Specialty must not exceed 100 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),

  body('available_schedule')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Available schedule must not exceed 1000 characters')
    .trim()
];

// Department validation rules
const validateDepartment = [
  body('department_name')
    .notEmpty()
    .withMessage('Department name is required')
    .isLength({ max: 100 })
    .withMessage('Department name must not exceed 100 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim()
];

// Doctor-Department assignment validation
const validateDoctorDepartment = [
  body('doctor_id')
    .isInt({ min: 1 })
    .withMessage('Valid doctor ID is required'),

  body('department_id')
    .isInt({ min: 1 })
    .withMessage('Valid department ID is required')
];

// Appointment update validation (all fields optional) - DISABLED FOR TESTING
const validateAppointmentUpdate = [
  (req, res, next) => next() // Bypass all validation
];

// Auth validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateRegisterPatient = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),

  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),

  body('date_of_birth')
    .isISO8601()
    .withMessage('Valid date of birth is required (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }

      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),

  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),

  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters')
    .trim()
];

const validateRegisterStaff = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),

  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Nurse', 'Worker', 'Admin', 'Pharmacist', 'Technician', 'Lab Assistant', 'Driver'])
    .withMessage('Invalid role'),

  body('position')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Position must not exceed 100 characters')
    .trim(),

  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid department ID is required'),

  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters')
];

const validateChangePassword = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),

  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Medical Record validation rules
const validateMedicalRecord = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),

  body('doctor_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid doctor ID is required'),

  // visit_date removed - schema uses created_at instead

  body('diagnosis')
    .notEmpty()
    .withMessage('Diagnosis is required')
    .isLength({ max: 10000 })
    .withMessage('Diagnosis must not exceed 10000 characters')
    .trim(),

  body('treatment')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Treatment must not exceed 10000 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters')
    .trim(),

  body('follow_up_date')
    .optional()
    .isISO8601()
    .withMessage('Valid follow-up date is required (YYYY-MM-DD)')
];

const validateMedicalRecordUpdate = [
  body('visit_date')
    .optional()
    .isISO8601()
    .withMessage('Valid visit date is required (YYYY-MM-DD)'),

  body('diagnosis')
    .optional()
    .notEmpty()
    .withMessage('Diagnosis cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Diagnosis must not exceed 1000 characters')
    .trim(),

  body('treatment')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Treatment must not exceed 2000 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Notes must not exceed 2000 characters')
    .trim(),

  body('follow_up_date')
    .optional()
    .isISO8601()
    .withMessage('Valid follow-up date is required (YYYY-MM-DD)')
];

const validateMedicalRecordMedicine = [
  body('medicine_id')
    .isInt({ min: 1 })
    .withMessage('Valid medicine ID is required'),

  body('dosage')
    .notEmpty()
    .withMessage('Dosage is required')
    .isLength({ max: 100 })
    .withMessage('Dosage must not exceed 100 characters')
    .trim(),

  body('frequency')
    .notEmpty()
    .withMessage('Frequency is required')
    .isLength({ max: 100 })
    .withMessage('Frequency must not exceed 100 characters')
    .trim(),

  body('duration')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Duration must not exceed 100 characters')
    .trim()
];

// Billing validation rules
const validateBilling = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),

  body('billing_date')
    .isISO8601()
    .withMessage('Valid billing date is required (YYYY-MM-DD)'),

  body('total_amount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),

  body('payment_status')
    .optional()
    .isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
    .withMessage('Invalid payment status'),

  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('Valid payment date is required (YYYY-MM-DD)'),

  body('payment_method')
    .optional()
    .isIn(['CASH', 'TRANSFER'])
    .withMessage('Payment method must be either CASH or TRANSFER'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim()
];

const validateBillingUpdate = [
  body('total_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),

  body('payment_status')
    .optional()
    .isIn(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
    .withMessage('Invalid payment status'),

  body('payment_date')
    .optional()
    .isISO8601()
    .withMessage('Valid payment date is required (YYYY-MM-DD)'),

  body('payment_method')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Payment method must not exceed 50 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim()
];

// Staff validation rules
const validateStaff = [
  body('first_name')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),

  body('last_name')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Nurse', 'Worker', 'Admin', 'Pharmacist', 'Technician', 'Lab Assistant', 'Driver'])
    .withMessage('Invalid role'),

  body('position')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Position must not exceed 100 characters')
    .trim(),

  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid department ID is required'),

  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateStaffUpdate = [
  body('first_name')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),

  body('last_name')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(['Nurse', 'Worker', 'Admin', 'Pharmacist', 'Technician', 'Lab Assistant', 'Driver'])
    .withMessage('Invalid role'),

  body('position')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Position must not exceed 100 characters')
    .trim(),

  body('department_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid department ID is required'),

  body('contact_number')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Contact number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Contact number contains invalid characters'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Medicine validation rules
const validateMedicine = [
  body('name')
    .notEmpty()
    .withMessage('Medicine name is required')
    .isLength({ max: 100 })
    .withMessage('Medicine name must not exceed 100 characters')
    .trim(),

  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand must not exceed 50 characters')
    .trim(),

  body('type')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Type must not exceed 20 characters')
    .trim(),

  body('dosage')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Dosage must not exceed 50 characters')
    .trim(),

  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const expiryDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          throw new Error('Expiry date cannot be in the past');
        }
      }
      return true;
    })
];

const validateMedicineUpdate = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Medicine name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Medicine name must not exceed 100 characters')
    .trim(),

  body('brand')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Brand must not exceed 50 characters')
    .trim(),

  body('type')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Type must not exceed 20 characters')
    .trim(),

  body('dosage')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Dosage must not exceed 50 characters')
    .trim(),

  body('stock_quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),

  body('expiry_date')
    .optional()
    .isISO8601()
    .withMessage('Valid expiry date is required (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const expiryDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
          throw new Error('Expiry date cannot be in the past');
        }
      }
      return true;
    })
    .trim()
];

// Pharmacy validation rules
const validatePharmacy = [
  body('prescription_id')
    .isInt({ min: 1 })
    .withMessage('Valid prescription ID is required')
];

// Nurse validation rules
const validateNurse = [
  body('staff_id')
    .isInt({ min: 1 })
    .withMessage('Valid staff ID is required'),

  body('license_number')
    .optional()
    .isLength({ max: 50 })
    .withMessage('License number must not exceed 50 characters')
    .trim(),

  body('specialization')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Specialization must not exceed 100 characters')
    .trim()
];

// Worker validation rules
const validateWorker = [
  body('staff_id')
    .isInt({ min: 1 })
    .withMessage('Valid staff ID is required'),

  body('job_type')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Job type must not exceed 100 characters')
    .trim(),

  body('shift')
    .optional()
    .isIn(['MORNING', 'AFTERNOON', 'NIGHT', 'ROTATING'])
    .withMessage('Invalid shift type')
];

// Room Type validation rules
const validateRoomType = [
  body('type_name')
    .notEmpty()
    .withMessage('Room type name is required')
    .isLength({ max: 50 })
    .withMessage('Room type name must not exceed 50 characters')
    .trim(),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim(),

  body('base_price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number')
];

// Room validation rules
const validateRoom = [
  body('room_number')
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ max: 20 })
    .withMessage('Room number must not exceed 20 characters')
    .trim(),

  body('room_type_id')
    .isInt({ min: 1 })
    .withMessage('Valid room type ID is required'),

  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'])
    .withMessage('Invalid room status'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim()
];

const validateRoomUpdate = [
  body('room_number')
    .optional()
    .notEmpty()
    .withMessage('Room number cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Room number must not exceed 20 characters')
    .trim(),

  body('room_type_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid room type ID is required'),

  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_ORDER'])
    .withMessage('Invalid room status'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
    .trim()
];

// Room Assignment validation rules
const validateRoomAssignment = [
  body('room_id')
    .isInt({ min: 1 })
    .withMessage('Valid room ID is required'),

  body('assignment_type')
    .notEmpty()
    .withMessage('Assignment type is required')
    .isIn(['PATIENT', 'STAFF'])
    .withMessage('Invalid assignment type'),

  body('patient_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),

  body('staff_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid staff ID is required'),

  body('start_date')
    .isISO8601()
    .withMessage('Valid start date is required (YYYY-MM-DD)'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

const validateRoomAssignmentUpdate = [
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required (YYYY-MM-DD)'),

  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.body.start_date && new Date(value) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Cleaning Service validation rules
const validateCleaningService = [
  body('room_id')
    .isInt({ min: 1 })
    .withMessage('Valid room ID is required'),

  body('cleaning_type')
    .notEmpty()
    .withMessage('Cleaning type is required')
    .isIn(['ROUTINE', 'DEEP_CLEAN', 'DISINFECTION', 'MAINTENANCE'])
    .withMessage('Invalid cleaning type'),

  body('cleaning_date')
    .optional()
    .isISO8601()
    .withMessage('Valid cleaning date is required (YYYY-MM-DD)'),

  body('start_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM)'),

  body('end_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM)')
    .custom((value, { req }) => {
      if (value && req.body.start_time && value <= req.body.start_time) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),

  body('supplies_used')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Supplies used must not exceed 500 characters')
    .trim()
];

const validateCleaningServiceUpdate = [
  body('cleaning_type')
    .optional()
    .isIn(['ROUTINE', 'DEEP_CLEAN', 'DISINFECTION', 'MAINTENANCE'])
    .withMessage('Invalid cleaning type'),

  body('cleaning_date')
    .optional()
    .isISO8601()
    .withMessage('Valid cleaning date is required (YYYY-MM-DD)'),

  body('start_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid start time is required (HH:MM)'),

  body('end_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid end time is required (HH:MM)')
    .custom((value, { req }) => {
      if (value && req.body.start_time && value <= req.body.start_time) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),

  body('supplies_used')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Supplies used must not exceed 500 characters')
    .trim()
];

// Prescription validation rules - updated for multiple medicines
const validatePrescription = [
  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),

  body('diagnosis')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Diagnosis must not exceed 500 characters')
    .trim(),

  body('instructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Instructions must not exceed 1000 characters')
    .trim(),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one medicine'),

  body('items.*.medicine_id')
    .isInt({ min: 1 })
    .withMessage('Valid medicine ID is required for each item'),

  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),

  body('items.*.dosage')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Dosage must not exceed 255 characters')
    .trim(),

  body('items.*.frequency')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Frequency must not exceed 255 characters')
    .trim(),

  body('items.*.duration')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Duration must not exceed 255 characters')
    .trim(),

  body('items.*.instructions')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Item instructions must not exceed 500 characters')
    .trim()
];

const validatePrescriptionUpdate = [
  body('diagnosis')
    .optional()
    .notEmpty()
    .withMessage('Diagnosis cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Diagnosis must not exceed 1000 characters')
    .trim(),

  body('medications')
    .optional()
    .notEmpty()
    .withMessage('Medications cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Medications must not exceed 2000 characters')
    .trim(),

  body('dosage_instructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Dosage instructions must not exceed 1000 characters')
    .trim(),

  body('duration')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Duration must not exceed 100 characters')
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),

  body('status')
    .optional()
    .isIn(['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'])
    .withMessage('Invalid prescription status')
];

// Ambulance validation rules
const validateAmbulance = [
  body('vehicle_number')
    .notEmpty()
    .withMessage('Vehicle number is required')
    .isLength({ max: 20 })
    .withMessage('Vehicle number must not exceed 20 characters')
    .trim(),

  body('driver_name')
    .notEmpty()
    .withMessage('Driver name is required')
    .isLength({ max: 100 })
    .withMessage('Driver name must not exceed 100 characters')
    .trim(),

  body('driver_contact')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Driver contact must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Driver contact contains invalid characters'),

  body('model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Model must not exceed 50 characters')
    .trim(),

  body('availability')
    .optional()
    .isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'])
    .withMessage('Invalid availability status'),

  body('equipment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Equipment description must not exceed 1000 characters')
    .trim()
];

const validateAmbulanceUpdate = [
  body('vehicle_number')
    .optional()
    .notEmpty()
    .withMessage('Vehicle number cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Vehicle number must not exceed 20 characters')
    .trim(),

  body('driver_name')
    .optional()
    .notEmpty()
    .withMessage('Driver name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Driver name must not exceed 100 characters')
    .trim(),

  body('driver_contact')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Driver contact must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Driver contact contains invalid characters'),

  body('model')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Model must not exceed 50 characters')
    .trim(),

  body('availability')
    .optional()
    .isIn(['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'OUT_OF_SERVICE'])
    .withMessage('Invalid availability status'),

  body('equipment')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Equipment description must not exceed 1000 characters')
    .trim()
];

// Ambulance Log validation rules
const validateAmbulanceLog = [
  body('ambulance_id')
    .isInt({ min: 1 })
    .withMessage('Valid ambulance ID is required'),

  body('patient_id')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),

  body('pickup_location')
    .notEmpty()
    .withMessage('Pickup location is required')
    .isLength({ max: 200 })
    .withMessage('Pickup location must not exceed 200 characters')
    .trim(),

  body('destination')
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ max: 200 })
    .withMessage('Destination must not exceed 200 characters')
    .trim(),

  body('dispatch_time')
    .optional()
    .isISO8601()
    .withMessage('Valid dispatch time is required'),

  body('arrival_time')
    .optional()
    .isISO8601()
    .withMessage('Valid arrival time is required'),

  body('completion_time')
    .optional()
    .isISO8601()
    .withMessage('Valid completion time is required'),

  body('status')
    .optional()
    .isIn(['DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid ambulance log status'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim()
];

const validateAmbulanceLogUpdate = [
  body('pickup_location')
    .optional()
    .notEmpty()
    .withMessage('Pickup location cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Pickup location must not exceed 200 characters')
    .trim(),

  body('destination')
    .optional()
    .notEmpty()
    .withMessage('Destination cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Destination must not exceed 200 characters')
    .trim(),

  body('dispatch_time')
    .optional()
    .isISO8601()
    .withMessage('Valid dispatch time is required'),

  body('arrival_time')
    .optional()
    .isISO8601()
    .withMessage('Valid arrival time is required'),

  body('completion_time')
    .optional()
    .isISO8601()
    .withMessage('Valid completion time is required'),

  body('status')
    .optional()
    .isIn(['DISPATCHED', 'EN_ROUTE', 'ON_SCENE', 'TRANSPORTING', 'COMPLETED', 'CANCELLED'])
    .withMessage('Invalid ambulance log status'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim()
];

// Parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID is required')
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Enhanced secure validation sets
const validatePatientSecure = [
  createSecureValidator('first_name', { required: true, maxLength: 50 }),
  createSecureValidator('last_name', { required: true, maxLength: 50 }),
  createSecureValidator('email', { isEmail: true }),
  createSecureValidator('contact_number', { 
    maxLength: 15, 
    matches: /^[\d\s\-\+\(\)]+$/, 
    matchesMessage: 'Contact number contains invalid characters' 
  }),
  createSecureValidator('date_of_birth', {
    required: true,
    custom: (value) => {
      if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }
  }),
  createSecureValidator('gender', { isIn: ['male', 'female', 'other'] }),
  createSecureValidator('address', { maxLength: 500 }),
  createSecureValidator('medical_history', { maxLength: 2000 }),
  handleValidationErrors
];

const validateLoginSecure = [
  createSecureValidator('email', { required: true, isEmail: true }),
  createSecureValidator('password', { required: true, minLength: 6 }),
  handleValidationErrors
];

const validateRegisterPatientSecure = [
  createSecureValidator('email', { required: true, isEmail: true }),
  createSecureValidator('password', { 
    required: true, 
    minLength: 6,
    matches: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    matchesMessage: 'Password must contain at least one lowercase letter, one uppercase letter, and one number'
  }),
  createSecureValidator('first_name', { required: true, maxLength: 50 }),
  createSecureValidator('last_name', { required: true, maxLength: 50 }),
  createSecureValidator('date_of_birth', {
    required: true,
    custom: (value) => {
      if (!value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
      return true;
    }
  }),
  createSecureValidator('gender', { isIn: ['male', 'female', 'other'] }),
  createSecureValidator('contact_number', { 
    maxLength: 15, 
    matches: /^[\d\s\-\+\(\)]+$/, 
    matchesMessage: 'Contact number contains invalid characters' 
  }),
  createSecureValidator('address', { maxLength: 500 }),
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  createSecureValidator('email', { required: true, isEmail: true, maxLength: 100 })
];

// Reset password validation  
const validateResetPassword = [
  createSecureValidator('token', { required: true, maxLength: 255 }),
  createSecureValidator('new_password', { required: true, minLength: 6, maxLength: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

module.exports = {
  // Enhanced secure validators
  createSecureValidator,
  handleValidationErrors,
  validatePatientSecure,
  validateLoginSecure,
  validateRegisterPatientSecure,
  
  // Legacy validators (maintained for compatibility)
  validatePatient,
  validatePatientUpdate,
  validateDoctor,
  validateDoctorUpdate,
  validateDepartment,
  validateDoctorDepartment,
  validateAppointment,
  validateAppointmentUpdate,
  validateMedicalRecord,
  validateMedicalRecordUpdate,
  validateMedicalRecordMedicine,
  validateBilling,
  validateBillingUpdate,
  validateStaff,
  validateStaffUpdate,
  validateMedicine,
  validateMedicineUpdate,
  validatePharmacy,
  validateNurse,
  validateWorker,
  validateRoomType,
  validateRoom,
  validateRoomUpdate,
  validateRoomAssignment,
  validateRoomAssignmentUpdate,
  validateCleaningService,
  validateCleaningServiceUpdate,
  validatePrescription,
  validatePrescriptionUpdate,
  validateAmbulance,
  validateAmbulanceUpdate,
  validateAmbulanceLog,
  validateAmbulanceLogUpdate,
  validateLogin,
  validateRegisterPatient,
  validateRegisterStaff,
  validateChangePassword,
  validateId,
  validatePagination,
  validateForgotPassword,
  validateResetPassword,
  validateAppointment: (req, res, next) => next(),
  validateAppointmentUpdate: (req, res, next) => next()
};

// Patient profile update validation (owner can update their own profile)
const validatePatientProfileUpdate = [
  body('first_name')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name must not exceed 50 characters')
    .trim(),
  
  body('last_name')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name must not exceed 50 characters')
    .trim(),
  
  body('phone')
    .optional()
    .isLength({ max: 15 })
    .withMessage('Phone number must not exceed 15 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number contains invalid characters'),
  
  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required (YYYY-MM-DD)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0 || age > 150) {
        throw new Error('Invalid date of birth');
      }
      
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters')
    .trim()
];

module.exports = {
  createSecureValidator,
  handleValidationErrors,
  validatePatientSecure,
  validateLoginSecure,
  validateRegisterPatientSecure,
  validatePatientProfileUpdate,
  
  // Legacy validators (maintained for compatibility)
  validatePatient,
  validatePatientUpdate,
  validateDoctor,
  validateDoctorUpdate,
  validateDepartment,
  validateDoctorDepartment,
  validateAppointment,
  validateAppointmentUpdate,
  validateMedicalRecord,
  validateMedicalRecordUpdate,
  validateMedicalRecordMedicine,
  validateBilling,
  validateBillingUpdate,
  validateStaff,
  validateStaffUpdate,
  validateMedicine,
  validateMedicineUpdate,
  validatePharmacy,
  validateNurse,
  validateWorker,
  validateRoomType,
  validateRoom,
  validateRoomUpdate,
  validateRoomAssignment,
  validateRoomAssignmentUpdate,
  validateCleaningService,
  validateCleaningServiceUpdate,
  validatePrescription,
  validatePrescriptionUpdate,
  validateAmbulance,
  validateAmbulanceUpdate,
  validateAmbulanceLog,
  validateAmbulanceLogUpdate,
  validateLogin,
  validateRegisterPatient,
  validateRegisterStaff,
  validateChangePassword,
  validateId,
  validatePagination,
  validateForgotPassword,
  validateResetPassword,
  validateAppointment: (req, res, next) => next(),
  validateAppointmentUpdate: (req, res, next) => next()
};
