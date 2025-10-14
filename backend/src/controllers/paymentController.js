const paymentService = require('../services/paymentService');

class PaymentController {
  /**
   * Create MOMO Payment
   * POST /api/v1/payment/momo/create
   */
  async createMomoPayment(req, res) {
    try {
      const { bill_id, amount, orderInfo } = req.body;

      if (!bill_id || !amount) {
        return res.status(400).json({
          success: false,
          error: 'bill_id and amount are required'
        });
      }

      const result = await paymentService.createMomoPayment({
        bill_id,
        amount,
        orderInfo: orderInfo || `Thanh toán hóa đơn #${bill_id}`
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: {
            paymentUrl: result.paymentUrl,
            transactionCode: result.transactionCode,
            transactionId: result.transactionId
          },
          message: 'MOMO payment created successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error('Create MOMO Payment Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Create VNPAY Payment
   * POST /api/v1/payment/vnpay/create
   */
  async createVNPayPayment(req, res) {
    try {
      const { bill_id, amount, orderInfo, bankCode } = req.body;

      if (!bill_id || !amount) {
        return res.status(400).json({
          success: false,
          error: 'bill_id and amount are required'
        });
      }

      const result = await paymentService.createVNPayPayment({
        bill_id,
        amount,
        orderInfo: orderInfo || `Thanh toán hóa đơn #${bill_id}`,
        bankCode
      });

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: {
            paymentUrl: result.paymentUrl,
            transactionCode: result.transactionCode,
            transactionId: result.transactionId
          },
          message: 'VNPAY payment created successfully'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.message
        });
      }
    } catch (error) {
      console.error('Create VNPAY Payment Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * MOMO IPN Callback
   * POST /api/v1/payment/momo/ipn
   */
  async handleMomoIPN(req, res) {
    try {
      console.log('MOMO IPN Received:', req.body);
      
      const result = await paymentService.handleMomoCallback(req.body);

      if (result.success) {
        return res.status(200).json({
          resultCode: 0,
          message: 'Success'
        });
      } else {
        return res.status(400).json({
          resultCode: 1,
          message: result.message
        });
      }
    } catch (error) {
      console.error('MOMO IPN Error:', error);
      return res.status(500).json({
        resultCode: 1,
        message: error.message
      });
    }
  }

  /**
   * VNPAY IPN Callback
   * GET /api/v1/payment/vnpay/ipn
   */
  async handleVNPayIPN(req, res) {
    try {
      console.log('VNPAY IPN Received:', req.query);
      
      const result = await paymentService.handleVNPayCallback(req.query);

      if (result.success) {
        return res.status(200).json({
          RspCode: '00',
          Message: 'Success'
        });
      } else {
        return res.status(400).json({
          RspCode: '01',
          Message: result.message
        });
      }
    } catch (error) {
      console.error('VNPAY IPN Error:', error);
      return res.status(500).json({
        RspCode: '99',
        Message: error.message
      });
    }
  }

  /**
   * Get Transaction Status
   * GET /api/v1/payment/status/:transactionCode
   */
  async getTransactionStatus(req, res) {
    try {
      const { transactionCode } = req.params;

      const transaction = await paymentService.getTransactionStatus(transactionCode);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Get Transaction Status Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Get all transactions for a bill
   * GET /api/v1/payment/bill/:bill_id
   */
  async getBillTransactions(req, res) {
    try {
      const { bill_id } = req.params;
      const { prisma } = require('../config/prisma');

      const transactions = await prisma.payment_transactions.findMany({
        where: { bill_id: parseInt(bill_id) },
        orderBy: { created_at: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: transactions
      });
    } catch (error) {
      console.error('Get Bill Transactions Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();
