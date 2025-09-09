const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const xss = require('xss');

// ============================================================================
// ADVANCED SECURITY MIDDLEWARE
// ============================================================================

/**
 * XSS Protection Middleware
 * Sanitizes all string inputs to prevent XSS attacks
 */
const xssProtection = (req, res, next) => {
  const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
      return xss(obj, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * SQL Injection Protection (additional layer beyond Prisma)
 * Blocks common SQL injection patterns
 */
const sqlInjectionProtection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /UNION(?:\s+ALL)?\s+SELECT/i,
    /INSERT(?:\s+INTO)?\s+\w+/i,
    /DELETE(?:\s+FROM)?\s+\w+/i,
    /UPDATE\s+\w+\s+SET/i,
    /DROP(?:\s+TABLE)?\s+\w+/i,
    /CREATE(?:\s+TABLE)?\s+\w+/i,
    /ALTER(?:\s+TABLE)?\s+\w+/i,
    /TRUNCATE(?:\s+TABLE)?\s+\w+/i
  ];

  const checkForSQLInjection = (value) => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const scanObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'string' && checkForSQLInjection(value)) {
          return true;
        }
        if (typeof value === 'object' && value !== null && scanObject(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check request body
  if (req.body && scanObject(req.body)) {
    return res.status(400).json({
      success: false,
      error: 'Potentially malicious input detected'
    });
  }

  // Check query parameters
  if (req.query && scanObject(req.query)) {
    return res.status(400).json({
      success: false,
      error: 'Potentially malicious input detected'
    });
  }

  // Check URL parameters
  if (req.params && scanObject(req.params)) {
    return res.status(400).json({
      success: false,
      error: 'Potentially malicious input detected'
    });
  }

  next();
};

/**
 * Enhanced Input Validation Middleware
 */
const validateAndSanitizeInput = [
  // Sanitize HTML content
  body('*').customSanitizer((value) => {
    if (typeof value === 'string') {
      return xss(value, {
        whiteList: {}, // No HTML allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style']
      });
    }
    return value;
  }),
  
  // Trim whitespace
  body('*').trim(),
  
  // Escape special characters in text fields
  body(['first_name', 'last_name', 'address', 'notes', 'description'])
    .optional()
    .escape(),
    
  // Validate email format more strictly
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail({
      gmail_lowercase: true,
      gmail_remove_dots: false,
      outlookdotcom_lowercase: true,
      yahoo_lowercase: true,
      icloud_lowercase: true
    })
    .custom((value) => {
      // Additional email validation
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),
];

/**
 * Enhanced Rate Limiting
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(options.windowMs / 1000) || 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for health checks
      return req.path === '/api/v1/health';
    },
    keyGenerator: (req) => {
      // Use combination of IP and user ID for authenticated requests
      return req.user ? `${req.ip}-${req.user.id}` : req.ip;
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Different rate limits for different endpoints
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Stricter limit for auth endpoints
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
    retryAfter: 900
  }
});

const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // General API limit
});

const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Very strict for sensitive operations
  message: {
    success: false,
    error: 'Rate limit exceeded for sensitive operation.',
    retryAfter: 60
  }
});

/**
 * Enhanced Security Headers
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  crossOriginEmbedderPolicy: false // Disable for API compatibility
});

/**
 * Request Size Limiting
 */
const requestSizeLimit = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const contentLength = parseInt(req.headers['content-length']);
  
  if (contentLength && contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      error: 'Request entity too large'
    });
  }
  
  next();
};

/**
 * IP Whitelist/Blacklist (configurable)
 */
const ipFilter = (req, res, next) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const clientIP = req.ip || req.connection.remoteAddress;
  const blacklist = process.env.IP_BLACKLIST?.split(',') || [];
  const whitelist = process.env.IP_WHITELIST?.split(',') || [];

  // Check blacklist
  if (blacklist.length > 0 && blacklist.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Check whitelist (if configured)
  if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  next();
};

/**
 * Request Logging for Security Monitoring
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /\/etc\/passwd/,
    /\/proc\/self/,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i  // Event handlers
  ];

  const logSecurity = (level, message, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.id,
      ...data
    };
    
    console.log(`[SECURITY-${level.toUpperCase()}]`, JSON.stringify(logEntry));
  };

  // Check for suspicious patterns in URL
  const url = req.originalUrl;
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    logSecurity('warn', 'Suspicious URL pattern detected', { url });
  }

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    
    if (body && !body.success && res.statusCode >= 400) {
      logSecurity('info', 'Failed request', {
        statusCode: res.statusCode,
        duration,
        error: body.error
      });
    }
    
    return originalJson.call(this, body);
  };

  next();
};

/**
 * Validation Error Handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log validation failures for security monitoring
    console.log('[SECURITY-INFO] Validation failed:', {
      ip: req.ip,
      url: req.originalUrl,
      errors: errors.array(),
      body: req.body
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

module.exports = {
  // Core security middleware
  xssProtection,
  sqlInjectionProtection,
  validateAndSanitizeInput,
  securityHeaders,
  requestSizeLimit,
  ipFilter,
  securityLogger,
  handleValidationErrors,
  
  // Rate limiting
  authRateLimit,
  apiRateLimit,
  strictRateLimit,
  createRateLimiter,
  
  // Combined middleware stack
  basicSecurity: [
    securityHeaders,
    requestSizeLimit,
    ipFilter,
    securityLogger,
    xssProtection,
    sqlInjectionProtection
  ],
  
  fullSecurity: [
    securityHeaders,
    requestSizeLimit,
    ipFilter,
    securityLogger,
    apiRateLimit,
    xssProtection,
    sqlInjectionProtection,
    ...validateAndSanitizeInput,
    handleValidationErrors
  ]
};
