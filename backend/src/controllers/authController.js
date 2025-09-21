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

      // Use transaction to create user, assign role, and create patient record
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Create user record for authentication
        const user = await tx.users.create({
          data: {
            email,
            password_hash: hashedPassword,
            is_active: true
          }
        });

        // Step 2: Get patient role and assign to user
        const patientRole = await tx.roles.findFirst({
          where: { role_name: 'patient', is_active: true }
        });

        if (patientRole) {
          await tx.user_roles.create({
            data: {
              user_id: user.user_id,
              role_id: patientRole.role_id,
              assigned_at: new Date(),
              is_active: true
            }
          });
        }

        // Step 3: Create patient record with user_id link
        // Generate patient code - P + timestamp + random
        const patientCode = `P${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        
        const patient = await tx.patients.create({
          data: {
            patient_code: patientCode,
            user_id: user.user_id, // Direct foreign key assignment
            first_name,
            last_name,
            email,
            date_of_birth: new Date(date_of_birth),
            gender,
            phone: contact_number, // Map contact_number to phone column
            address,
            medical_history: null
          }
        });

        return { patient, user, role: patientRole };
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: result.user.user_id,
          email: result.user.email,
          role: 'patient',
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
            role: 'patient',
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

      // Use transaction to create user, assign role, and create staff record
      const result = await prisma.$transaction(async (tx) => {
        // Step 1: Create user record for authentication
        const user = await tx.users.create({
          data: {
            email,
            password_hash: hashedPassword,
            is_active: true
          }
        });

        // Step 2: Get staff role and assign to user
        const staffRole = await tx.roles.findFirst({
          where: { role_name: role, is_active: true }
        });

        if (staffRole) {
          await tx.user_roles.create({
            data: {
              user_id: user.user_id,
              role_id: staffRole.role_id,
              assigned_at: new Date(),
              is_active: true
            }
          });
        }

        // Step 3: Create staff record with user_id link
        const staff = await tx.staff.create({
          data: {
            user_id: user.user_id, // Link to user record
            first_name,
            last_name,
            email,
            role,
            position,
            department_id: department_id ? Number(department_id) : null,
            phone: contact_number // Map contact_number to phone column
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

        return { staff, user, role: staffRole };
      });

      // Generate JWT token
      const token = jwt.sign(
        {
          id: result.user.user_id,
          email: result.user.email,
          role: result.role?.role_name || role,
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
          role: result.role?.role_name || role
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

      // Find user in users table with role information
      const user = await prisma.users.findFirst({
        where: {
          email,
          is_active: true
        },
        include: {
          user_roles: {
            include: {
              role: true
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
              department_id: true
            }
          }
        }
      });

      console.log('Login attempt for:', email);
      console.log('User found:', !!user);
      
      if (user) {
        console.log('User details:', {
          user_id: user.user_id,
          email: user.email,
          password_hash_exists: !!user.password_hash,
          password_hash_length: user.password_hash?.length,
          patient: !!user.patient,
          staff_member: !!user.staff_member
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Check password
      console.log('Comparing password...');
      console.log('Input password:', password);
      console.log('Stored hash:', user.password_hash);
      
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      console.log('Password valid:', isPasswordValid);
      
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

      // Get user role and additional info
      const userRole = user.user_roles?.[0]?.role?.role_name || 'patient';
      const patientId = user.patient?.patient_id || null;
      const staffId = user.staff_member?.staff_id || null;

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.user_id,
          user_id: user.user_id,
          email: user.email,
          role: userRole,
          patient_id: patientId,
          staff_id: staffId
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      console.log('Generated token:', token);
      console.log('Token length:', token.length);
      console.log('Token type:', typeof token);

      res.json({
        success: true,
        data: {
          user: {
            id: user.user_id,
            user_id: user.user_id,
            email: user.email,
            role: userRole,
            roles: user.user_roles?.map(ur => ur.role.role_name) || [userRole],
            patient_id: patientId,
            staff_id: staffId,
            profile: {
              first_name: user.patient?.first_name || user.staff_member?.first_name,
              last_name: user.patient?.last_name || user.staff_member?.last_name,
              position: user.staff_member?.position || null,
              staff_role: user.staff_member?.role || null
            },
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
      const { user } = req; // Already enriched by authenticateToken with roles & permissions

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      // Return the unified user object including roles/permissions
      res.json({
        success: true,
        data: user
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

  // Update patient profile (only owner can update)
  async updatePatientProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const userId = req.user.user_id;
      const { first_name, last_name, phone, address, date_of_birth, gender } = req.body;

      // Find the patient record for this user
      const existingPatient = await prisma.patients.findFirst({
        where: { user_id: userId }
      });

      if (!existingPatient) {
        return res.status(404).json({
          success: false,
          error: 'Patient record not found'
        });
      }

      // Prepare update data - only include fields that are provided
      const updateData = {};
      if (first_name !== undefined) updateData.first_name = first_name;
      if (last_name !== undefined) updateData.last_name = last_name;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (date_of_birth !== undefined) updateData.date_of_birth = new Date(date_of_birth);
      if (gender !== undefined) updateData.gender = gender;

      // Update patient record
      const updatedPatient = await prisma.patients.update({
        where: { patient_id: existingPatient.patient_id },
        data: updateData,
        select: {
          patient_id: true,
          patient_code: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          address: true,
          date_of_birth: true,
          gender: true,
          created_at: true,
          updated_at: true
        }
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          patient: updatedPatient
        }
      });

    } catch (error) {
      console.error('Update patient profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi khi cập nhật thông tin'
      });
    }
  }

  // Get current patient profile
  async getPatientProfile(req, res) {
    try {
      const userId = req.user.user_id;

      const patient = await prisma.patients.findFirst({
        where: { user_id: userId },
        select: {
          patient_id: true,
          patient_code: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          address: true,
          date_of_birth: true,
          gender: true,
          medical_history: true,
          created_at: true,
          updated_at: true
        }
      });

      if (!patient) {
        return res.status(404).json({
          success: false,
          error: 'Patient record not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          patient: patient
        }
      });

    } catch (error) {
      console.error('Get patient profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Đã xảy ra lỗi khi lấy thông tin'
      });
    }
  }
}

module.exports = new AuthController();
