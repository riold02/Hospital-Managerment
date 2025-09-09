const { prisma } = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const emailService = require('../services/emailService');

class AuthController {
  // Register patient
  async registerPatient(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, first_name, last_name, date_of_birth, gender, contact_number, address } = req.body;

      // Check if email already exists in patients table
      const existingPatient = await prisma.patients.findFirst({
        where: { email }
      });

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Check if email already exists in users table
      const existingUser = await prisma.users.findFirst({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Use transaction to create both patient and user records
      const result = await prisma.$transaction(async (tx) => {
        // Create patient record first
        const patient = await tx.patients.create({
          data: {
            first_name,
            last_name,
            email,
            date_of_birth: new Date(date_of_birth),
            gender,
            contact_number,
            address,
            medical_history: null
          }
        });

        // Create user record for authentication
        const user = await tx.users.create({
          data: {
            email,
            password_hash: hashedPassword,
            is_active: true
          }
        });

        return { patient, user };
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: result.user.user_id,
          email: result.user.email,
          role: result.user.role,
          patient_id: result.patient.patient_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.user_id,
            email: result.user.email,
            role: result.user.role,
            patient: result.patient
          },
          token
        },
        message: 'Patient registered successfully'
      });
    } catch (error) {
      console.error('Register patient error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Register staff
  async registerStaff(req, res) {
    try {
      // Admin-only guard
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'ADMIN');
      if (!isAdmin) {
        return res.status(403).json({ success: false, error: 'Forbidden: Admin only' });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, first_name, last_name, role, position, department_id, contact_number } = req.body;

      // Check if email already exists in staff table
      const existingStaff = await prisma.staff.findFirst({
        where: { email }
      });

      if (existingStaff) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Check if email already exists in users table
      const existingUser = await prisma.users.findFirst({
        where: { email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Use transaction to create both staff and user records
      const result = await prisma.$transaction(async (tx) => {
        // Create staff record first
        const staff = await tx.staff.create({
          data: {
            first_name,
            last_name,
            email,
            role,
            position,
            department_id: department_id ? Number(department_id) : null,
            contact_number
          },
          include: {
            departments: {
              select: {
                department_id: true,
                department_name: true
              }
            }
          }
        });

        // Create user record for authentication
        const user = await tx.users.create({
          data: {
            email,
            password_hash: hashedPassword,
            is_active: true
          }
        });

        return { staff, user };
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: result.user.user_id,
          email: result.user.email,
          role: result.user.role,
          staff_id: result.staff.staff_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        data: {
          token,
          user: result.staff,
          role: result.staff.role
        },
        message: 'Staff registered successfully'
      });
    } catch (error) {
      console.error('Register staff error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user in users table
      const user = await prisma.users.findFirst({
        where: {
          email,
          is_active: true
        }
      });

      console.log('Login attempt for:', email);
      console.log('User found:', !!user);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Get additional user info based on role
      let additionalInfo = null;
      if (user.patient_id) {
        const patient = await prisma.patients.findUnique({
          where: { patient_id: user.patient_id }
        });
        additionalInfo = { patient };
      } else if (user.staff_id) {
        const staff = await prisma.staff.findUnique({
          where: { staff_id: user.staff_id },
          include: {
            departments: {
              select: {
                department_id: true,
                department_name: true
              }
            }
          }
        });
        additionalInfo = { staff };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.user_id,
          email: user.email,
          role: user.role,
          patient_id: user.patient_id,
          staff_id: user.staff_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.user_id,
            email: user.email,
            role: user.role,
            ...additionalInfo
          },
          token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get current user info
  async getMe(req, res) {
    try {
      const { user } = req; // From auth middleware

      let userData = null;

      if (user.patient_id) {
        userData = await prisma.patients.findUnique({
          where: { patient_id: user.patient_id }
        });
      } else if (user.staff_id) {
        userData = await prisma.staff.findUnique({
          where: { staff_id: user.staff_id },
          include: {
            departments: {
              select: {
                department_id: true,
                department_name: true
              }
            }
          }
        });
      }

      if (!userData) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Get me error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.'
    });
  }

  // Change password
  async changePassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { user } = req;
      const { current_password, new_password } = req.body;

      // Get current user with password from users table
      const currentUser = await prisma.users.findUnique({
        where: { user_id: user.id },
        select: { password_hash: true }
      });

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(current_password, currentUser.password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(new_password, 12);

      // Update password in users table
      await prisma.users.update({
        where: { user_id: user.id },
        data: { 
          password_hash: hashedNewPassword,
          updated_at: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Forgot password - Send reset email
  async forgotPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email } = req.body;

      // Find user by email
      const user = await prisma.users.findFirst({
        where: {
          email: email.toLowerCase().trim(),
          is_active: true
        },
        include: {
          patient: {
            select: { first_name: true, last_name: true }
          },
          staff_member: {
            select: { first_name: true, last_name: true }
          }
        }
      });

      // Always return success to prevent email enumeration attacks
      // But only send email if user exists
      if (user) {
        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        
        // Set token expiration (default 30 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + (parseInt(process.env.RESET_TOKEN_EXPIRE_MINUTES) || 30));

        // Clean up any existing tokens for this user
        await prisma.password_reset_tokens.deleteMany({
          where: { user_id: user.user_id }
        });

        // Create new reset token record
        await prisma.password_reset_tokens.create({
          data: {
            user_id: user.user_id,
            token_hash: tokenHash,
            expires_at: expiresAt
          }
        });

        // Get user's full name
        let userName = '';
        if (user.patient) {
          userName = `${user.patient.first_name} ${user.patient.last_name}`;
        } else if (user.staff_member) {
          userName = `${user.staff_member.first_name} ${user.staff_member.last_name}`;
        }

        // Send reset email
        try {
          await emailService.sendPasswordResetEmail(email, resetToken, userName.trim());
          console.log(`Password reset email sent to: ${email}`);
        } catch (emailError) {
          console.error('Failed to send reset email:', emailError);
          // Don't expose email sending errors to client
        }
      }

      // Always return the same response regardless of whether user exists
      res.json({
        success: true,
        message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút tới.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi khi xử lý yêu cầu'
      });
    }
  }

  // Reset password with token
  async resetPassword(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { token, new_password } = req.body;

      if (!token || !new_password) {
        return res.status(400).json({
          success: false,
          error: 'Token và mật khẩu mới là bắt buộc'
        });
      }

      // Hash the provided token to compare with stored hash
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid reset token
      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          token_hash: tokenHash,
          expires_at: {
            gt: new Date() // Token hasn't expired
          },
          used_at: null // Token hasn't been used
        },
        include: {
          user: {
            include: {
              patient: {
                select: { first_name: true, last_name: true }
              },
              staff_member: {
                select: { first_name: true, last_name: true }
              }
            }
          }
        }
      });

      if (!resetToken) {
        return res.status(400).json({
          success: false,
          error: 'Token không hợp lệ hoặc đã hết hạn'
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(new_password, 12);

      // Use transaction to update password and mark token as used
      await prisma.$transaction(async (tx) => {
        // Update user password
        await tx.users.update({
          where: { user_id: resetToken.user_id },
          data: { 
            password_hash: hashedNewPassword,
            updated_at: new Date()
          }
        });

        // Mark token as used
        await tx.password_reset_tokens.update({
          where: { token_id: resetToken.token_id },
          data: { used_at: new Date() }
        });
      });

      // Get user's full name for confirmation email
      let userName = '';
      if (resetToken.user.patient) {
        userName = `${resetToken.user.patient.first_name} ${resetToken.user.patient.last_name}`;
      } else if (resetToken.user.staff_member) {
        userName = `${resetToken.user.staff_member.first_name} ${resetToken.user.staff_member.last_name}`;
      }

      // Send confirmation email
      try {
        await emailService.sendPasswordChangeConfirmation(resetToken.user.email, userName.trim());
        console.log(`Password change confirmation sent to: ${resetToken.user.email}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't fail the request if confirmation email fails
      }

      res.json({
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi khi đặt lại mật khẩu'
      });
    }
  }

  // Verify reset token (optional - to check if token is valid before showing reset form)
  async verifyResetToken(req, res) {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Token là bắt buộc'
        });
      }

      // Hash the provided token to compare with stored hash
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid reset token
      const resetToken = await prisma.password_reset_tokens.findFirst({
        where: {
          token_hash: tokenHash,
          expires_at: {
            gt: new Date() // Token hasn't expired
          },
          used_at: null // Token hasn't been used
        },
        include: {
          user: {
            select: {
              email: true,
              patient: {
                select: { first_name: true, last_name: true }
              },
              staff_member: {
                select: { first_name: true, last_name: true }
              }
            }
          }
        }
      });

      if (!resetToken) {
        return res.status(400).json({
          success: false,
          error: 'Token không hợp lệ hoặc đã hết hạn'
        });
      }

      // Get user info for display
      let userName = '';
      if (resetToken.user.patient) {
        userName = `${resetToken.user.patient.first_name} ${resetToken.user.patient.last_name}`;
      } else if (resetToken.user.staff_member) {
        userName = `${resetToken.user.staff_member.first_name} ${resetToken.user.staff_member.last_name}`;
      }

      res.json({
        success: true,
        data: {
          email: resetToken.user.email,
          userName: userName.trim(),
          expiresAt: resetToken.expires_at
        },
        message: 'Token hợp lệ'
      });
    } catch (error) {
      console.error('Verify reset token error:', error);
      res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi khi xác thực token'
      });
    }
  }
}

module.exports = new AuthController();
