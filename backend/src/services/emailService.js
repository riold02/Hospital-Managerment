const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Cấu hình email transporter
    // Sử dụng Gmail SMTP (có thể thay đổi theo provider khác)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Email gửi
        pass: process.env.EMAIL_PASSWORD // App password hoặc OAuth2
      },
      // Hoặc sử dụng SMTP configuration tùy chỉnh:
      // host: process.env.SMTP_HOST,
      // port: process.env.SMTP_PORT,
      // secure: process.env.SMTP_SECURE === 'true',
      // auth: {
      //   user: process.env.SMTP_USER,
      //   pass: process.env.SMTP_PASSWORD
      // }
    });
  }

  /**
   * Gửi email reset password
   * @param {string} email - Email người nhận
   * @param {string} resetToken - Token reset password
   * @param {string} userName - Tên người dùng
   */
  async sendPasswordResetEmail(email, resetToken, userName = '') {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
      const expireTime = process.env.RESET_TOKEN_EXPIRE_MINUTES || 30;

      const mailOptions = {
        from: {
          name: 'Hospital Management System',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Đặt lại mật khẩu - Hospital Management System',
        html: this.getPasswordResetTemplate(userName, resetUrl, expireTime)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Template HTML cho email reset password
   */
  getPasswordResetTemplate(userName, resetUrl, expireTime) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đặt lại mật khẩu</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
        }
        .title {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .reset-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .reset-button:hover {
            background-color: #1d4ed8;
        }
        .warning {
            background-color: #fef3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .security-note {
            background-color: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 Hospital Management System</div>
            <h1 class="title">Yêu cầu đặt lại mật khẩu</h1>
        </div>

        <div class="content">
            <p>Xin chào ${userName || 'bạn'},</p>
            
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trong hệ thống Hospital Management System.</p>
            
            <p>Để đặt lại mật khẩu, vui lòng nhấp vào nút bên dưới:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="reset-button">Đặt lại mật khẩu</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul>
                    <li>Link này sẽ hết hạn sau <strong>${expireTime} phút</strong></li>
                    <li>Link chỉ có thể sử dụng một lần duy nhất</li>
                    <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                </ul>
            </div>

            <p>Nếu nút không hoạt động, bạn có thể copy và paste link sau vào trình duyệt:</p>
            <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace;">
                ${resetUrl}
            </p>
        </div>

        <div class="security-note">
            <strong>🔒 Bảo mật:</strong> Vì lý do bảo mật, chúng tôi không bao giờ gửi mật khẩu qua email. 
            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng liên hệ với bộ phận IT ngay lập tức.
        </div>

        <div class="footer">
            <p>Email này được gửi từ hệ thống Hospital Management System</p>
            <p>Vui lòng không trả lời email này</p>
            <p>© 2025 Hospital Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Gửi email xác nhận đổi mật khẩu thành công
   */
  async sendPasswordChangeConfirmation(email, userName = '') {
    try {
      const mailOptions = {
        from: {
          name: 'Hospital Management System',
          address: process.env.EMAIL_USER
        },
        to: email,
        subject: 'Mật khẩu đã được thay đổi - Hospital Management System',
        html: this.getPasswordChangeConfirmationTemplate(userName)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password change confirmation email sent:', result.messageId);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending password change confirmation:', error);
      throw new Error('Failed to send confirmation email');
    }
  }

  /**
   * Template xác nhận đổi mật khẩu thành công
   */
  getPasswordChangeConfirmationTemplate(userName) {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mật khẩu đã được thay đổi</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
        }
        .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
        }
        .title {
            color: #1f2937;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .content {
            margin-bottom: 30px;
        }
        .success-box {
            background-color: #f0fdf4;
            border: 1px solid #10b981;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .security-note {
            background-color: #f8f9fa;
            border-left: 4px solid #dc3545;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏥 Hospital Management System</div>
            <div class="success-icon">✅</div>
            <h1 class="title">Mật khẩu đã được thay đổi thành công</h1>
        </div>

        <div class="content">
            <p>Xin chào ${userName || 'bạn'},</p>
            
            <div class="success-box">
                <h3>🎉 Thay đổi mật khẩu thành công!</h3>
                <p>Mật khẩu cho tài khoản của bạn đã được cập nhật thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong></p>
            </div>
            
            <p>Từ bây giờ, bạn có thể sử dụng mật khẩu mới để đăng nhập vào hệ thống Hospital Management System.</p>
        </div>

        <div class="security-note">
            <strong>🔒 Lưu ý bảo mật:</strong> 
            <p>Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với bộ phận IT ngay lập tức để bảo vệ tài khoản của bạn.</p>
        </div>

        <div class="footer">
            <p>Email này được gửi từ hệ thống Hospital Management System</p>
            <p>Vui lòng không trả lời email này</p>
            <p>© 2025 Hospital Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Kiểm tra kết nối email service
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
