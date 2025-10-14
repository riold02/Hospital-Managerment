const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import security middleware
const {
  basicSecurity,
  authRateLimit,
  apiRateLimit,
  securityHeaders,
  xssProtection,
  sqlInjectionProtection
} = require('./src/middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (for rate limiting and IP detection)
app.set('trust proxy', 1);

// Enhanced Security Headers
app.use(securityHeaders);

// Enhanced CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'https://localhost:3000',
  'https://localhost:3001',
  'https://localhost:3002'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
}));

// Apply basic security middleware
app.use(basicSecurity);

// Additional XSS and SQL injection protection
app.use(xssProtection);
app.use(sqlInjectionProtection);

// Rate limiting for API routes
app.use('/api/', apiRateLimit);

// Compression middleware
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint (MUST be before routes with dynamic parameters)
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: require('./package.json').version,
    memory: process.memoryUsage()
  });
});

// API Documentation
app.use('/api/v1/docs', require('./src/routes/docs'));

// API Routes with enhanced security
app.use('/api/v1/auth', authRateLimit, require('./src/routes/auth'));
app.use('/api/v1/patients', require('./src/routes/patients'));
app.use('/api/v1/doctors', require('./src/routes/doctors'));
app.use('/api/v1/appointments', require('./src/routes/appointments'));
app.use('/api/v1/departments', require('./src/routes/departments'));
app.use('/api/v1/medical-records', require('./src/routes/medicalRecords'));
app.use('/api/v1/billing', require('./src/routes/billing'));
app.use('/api/v1/payment', require('./src/routes/payment')); // Payment gateway integration
app.use('/api/v1/services', require('./src/routes/services'));
app.use('/api/v1/staff', require('./src/routes/staff'));
app.use('/api/v1/medicine', require('./src/routes/medicine'));
app.use('/api/v1/pharmacy', require('./src/routes/pharmacy'));
app.use('/api/v1', require('./src/routes/rooms')); // Room types, rooms, and room assignments
app.use('/api/v1/nurse-assignments', require('./src/routes/nurseAssignments')); // Nurse-patient assignments
app.use('/api/v1/cleaning-service', require('./src/routes/cleaningService'));
app.use('/api/v1/prescriptions', require('./src/routes/prescriptions'));
app.use('/api/v1/ambulances', require('./src/routes/ambulances')); // Ambulances and Driver dashboard
app.use('/api/v1/ambulance-log', require('./src/routes/ambulanceLogs')); // Ambulance logs
app.use('/api/v1/reports', require('./src/routes/reports'));
app.use('/api/v1/dashboard', require('./src/routes/dashboard'));

// Role-specific Dashboard Routes
app.use('/api/v1/admin', require('./src/routes/admin')); // Admin dashboard
app.use('/api/v1/nurse', require('./src/routes/nurse')); // Nurse dashboard  
app.use('/api/v1/doctor', require('./src/routes/doctorDashboard')); // Doctor dashboard
app.use('/api/v1/lab-assistant', require('./src/routes/labAssistant')); // Lab Assistant dashboard

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Hospital Management System API',
    version: '1.0.0',
    documentation: '/api/v1/docs',
    health: '/api/v1/health'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Supabase errors
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.details
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Hospital Management Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
