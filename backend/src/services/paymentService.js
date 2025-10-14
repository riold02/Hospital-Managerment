const crypto = require('crypto');
const axios = require('axios');
const { prisma } = require('../config/prisma');

/**
 * Payment Service for MOMO and VNPAY Integration
 * Using Test/Sandbox environments for easy testing
 */

class PaymentService {
  constructor() {
    // MOMO Test Credentials (Sandbox)
    this.momo = {
      partnerCode: 'MOMOBKUN20180529',
      accessKey: 'klm05TvNBzhg7h7j',
      secretKey: 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
      endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
      redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/momo/callback',
      ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3001/api/v1/payment/momo/ipn'
    };

    // VNPAY Test Credentials (Sandbox)
    this.vnpay = {
      tmnCode: 'DEMO', // Test Terminal ID
      hashSecret: 'DEMOHASHSECRET', // Test Hash Secret
      endpoint: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay/callback',
      ipnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3001/api/v1/payment/vnpay/ipn'
    };
  }

  /**
   * Generate unique transaction code
   */
  generateTransactionCode(prefix = 'TXN') {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Create MOMO Payment
   * @param {Object} paymentData - { bill_id, amount, orderInfo }
   */
  async createMomoPayment(paymentData) {
    try {
      const { bill_id, amount, orderInfo = 'Thanh toán viện phí' } = paymentData;

      // Generate transaction code
      const orderId = this.generateTransactionCode('MOMO');
      const requestId = orderId;

      // Create payment transaction record
      const transaction = await prisma.payment_transactions.create({
        data: {
          bill_id: parseInt(bill_id),
          payment_gateway: 'MOMO',
          transaction_code: orderId,
          amount: parseFloat(amount),
          status: 'PENDING'
        }
      });

      // Prepare MOMO request
      const requestBody = {
        partnerCode: this.momo.partnerCode,
        partnerName: 'Hospital Management',
        storeId: 'HospitalStore',
        requestId: requestId,
        amount: amount.toString(),
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: this.momo.redirectUrl,
        ipnUrl: this.momo.ipnUrl,
        lang: 'vi',
        requestType: 'captureWallet',
        autoCapture: true,
        extraData: Buffer.from(JSON.stringify({
          bill_id,
          transaction_id: transaction.transaction_id
        })).toString('base64')
      };

      // Generate signature
      const rawSignature = `accessKey=${this.momo.accessKey}&amount=${requestBody.amount}&extraData=${requestBody.extraData}&ipnUrl=${requestBody.ipnUrl}&orderId=${requestBody.orderId}&orderInfo=${requestBody.orderInfo}&partnerCode=${requestBody.partnerCode}&redirectUrl=${requestBody.redirectUrl}&requestId=${requestBody.requestId}&requestType=${requestBody.requestType}`;
      
      const signature = crypto
        .createHmac('sha256', this.momo.secretKey)
        .update(rawSignature)
        .digest('hex');

      requestBody.signature = signature;

      // Send request to MOMO
      const response = await axios.post(this.momo.endpoint, requestBody, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data.resultCode === 0) {
        // Update transaction with payment URL
        await prisma.payment_transactions.update({
          where: { transaction_id: transaction.transaction_id },
          data: {
            payment_url: response.data.payUrl,
            gateway_response: response.data
          }
        });

        return {
          success: true,
          paymentUrl: response.data.payUrl,
          transactionCode: orderId,
          transactionId: transaction.transaction_id
        };
      } else {
        // Update transaction status to FAILED
        await prisma.payment_transactions.update({
          where: { transaction_id: transaction.transaction_id },
          data: {
            status: 'FAILED',
            gateway_response: response.data
          }
        });

        return {
          success: false,
          message: response.data.message || 'Tạo thanh toán MOMO thất bại'
        };
      }
    } catch (error) {
      console.error('MOMO Payment Error:', error);
      throw new Error(`MOMO Payment Error: ${error.message}`);
    }
  }

  /**
   * Create VNPAY Payment
   * @param {Object} paymentData - { bill_id, amount, orderInfo }
   */
  async createVNPayPayment(paymentData) {
    try {
      const { bill_id, amount, orderInfo = 'Thanh toán viện phí', bankCode = '' } = paymentData;

      // Generate transaction code
      const orderId = this.generateTransactionCode('VNPAY');

      // Create payment transaction record
      const transaction = await prisma.payment_transactions.create({
        data: {
          bill_id: parseInt(bill_id),
          payment_gateway: 'VNPAY',
          transaction_code: orderId,
          amount: parseFloat(amount),
          status: 'PENDING'
        }
      });

      // Create date format for VNPay (yyyyMMddHHmmss)
      const createDate = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);

      // Prepare VNPay parameters
      const vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: this.vnpay.tmnCode,
        vnp_Amount: (amount * 100).toString(), // VNPay requires amount * 100
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: '127.0.0.1',
        vnp_Locale: 'vn',
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: this.vnpay.returnUrl,
        vnp_TxnRef: orderId
      };

      if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
      }

      // Sort parameters
      const sortedParams = Object.keys(vnp_Params).sort();
      const signData = sortedParams
        .map(key => `${key}=${vnp_Params[key]}`)
        .join('&');

      // Generate secure hash
      const hmac = crypto.createHmac('sha512', this.vnpay.hashSecret);
      const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
      vnp_Params.vnp_SecureHash = signed;

      // Build payment URL
      const queryString = Object.keys(vnp_Params)
        .map(key => `${key}=${encodeURIComponent(vnp_Params[key])}`)
        .join('&');
      
      const paymentUrl = `${this.vnpay.endpoint}?${queryString}`;

      // Update transaction with payment URL
      await prisma.payment_transactions.update({
        where: { transaction_id: transaction.transaction_id },
        data: {
          payment_url: paymentUrl,
          gateway_response: vnp_Params
        }
      });

      return {
        success: true,
        paymentUrl: paymentUrl,
        transactionCode: orderId,
        transactionId: transaction.transaction_id
      };
    } catch (error) {
      console.error('VNPAY Payment Error:', error);
      throw new Error(`VNPAY Payment Error: ${error.message}`);
    }
  }

  /**
   * Verify MOMO callback signature
   */
  verifyMomoSignature(data) {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature
    } = data;

    const rawSignature = `accessKey=${this.momo.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', this.momo.secretKey)
      .update(rawSignature)
      .digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Verify VNPAY callback signature
   */
  verifyVNPaySignature(params) {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sortedParams = Object.keys(params).sort();
    const signData = sortedParams
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', this.vnpay.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  }

  /**
   * Handle MOMO IPN callback
   */
  async handleMomoCallback(callbackData) {
    try {
      // Verify signature
      const isValid = this.verifyMomoSignature(callbackData);
      
      if (!isValid) {
        return { success: false, message: 'Invalid signature' };
      }

      const { orderId, resultCode, transId, responseTime } = callbackData;

      // Find transaction
      const transaction = await prisma.payment_transactions.findUnique({
        where: { transaction_code: orderId },
        include: { bill: true }
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Update transaction status
      const status = resultCode === 0 ? 'SUCCESS' : 'FAILED';
      const paid_at = resultCode === 0 ? new Date() : null;

      await prisma.payment_transactions.update({
        where: { transaction_id: transaction.transaction_id },
        data: {
          status,
          gateway_transaction_id: transId?.toString(),
          gateway_response: callbackData,
          paid_at
        }
      });

      // If successful, update billing
      if (resultCode === 0) {
        await prisma.billing.update({
          where: { bill_id: transaction.bill_id },
          data: {
            payment_status: 'PAID',
            payment_method: 'MOMO',
            payment_date: new Date()
          }
        });
      }

      return { success: true, status };
    } catch (error) {
      console.error('MOMO Callback Error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handle VNPAY IPN callback
   */
  async handleVNPayCallback(callbackParams) {
    try {
      // Verify signature
      const isValid = this.verifyVNPaySignature({ ...callbackParams });
      
      if (!isValid) {
        return { success: false, message: 'Invalid signature' };
      }

      const { vnp_TxnRef, vnp_ResponseCode, vnp_TransactionNo } = callbackParams;

      // Find transaction
      const transaction = await prisma.payment_transactions.findUnique({
        where: { transaction_code: vnp_TxnRef },
        include: { bill: true }
      });

      if (!transaction) {
        return { success: false, message: 'Transaction not found' };
      }

      // Update transaction status
      const status = vnp_ResponseCode === '00' ? 'SUCCESS' : 'FAILED';
      const paid_at = vnp_ResponseCode === '00' ? new Date() : null;

      await prisma.payment_transactions.update({
        where: { transaction_id: transaction.transaction_id },
        data: {
          status,
          gateway_transaction_id: vnp_TransactionNo,
          gateway_response: callbackParams,
          paid_at
        }
      });

      // If successful, update billing
      if (vnp_ResponseCode === '00') {
        await prisma.billing.update({
          where: { bill_id: transaction.bill_id },
          data: {
            payment_status: 'PAID',
            payment_method: 'VNPAY',
            payment_date: new Date()
          }
        });
      }

      return { success: true, status };
    } catch (error) {
      console.error('VNPAY Callback Error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get payment transaction status
   */
  async getTransactionStatus(transactionCode) {
    try {
      const transaction = await prisma.payment_transactions.findUnique({
        where: { transaction_code: transactionCode },
        include: {
          bill: {
            include: {
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

      return transaction;
    } catch (error) {
      console.error('Get Transaction Status Error:', error);
      throw new Error(`Get Transaction Status Error: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
