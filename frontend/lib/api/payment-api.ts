import { apiClient } from '../api-client'

// Payment Gateway Types
export type PaymentGateway = 'MOMO' | 'VNPAY' | 'CASH'

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'

export interface PaymentTransaction {
  transaction_id: number
  bill_id: number
  payment_gateway: PaymentGateway
  transaction_code: string
  amount: number
  status: PaymentStatus
  payment_url?: string
  gateway_transaction_id?: string
  gateway_response?: any
  paid_at?: string
  created_at: string
  updated_at: string
}

export interface CreatePaymentRequest {
  bill_id: number
  amount: number
  orderInfo?: string
  bankCode?: string // For VNPAY only
}

export interface CreatePaymentResponse {
  paymentUrl: string
  transactionCode: string
  transactionId: number
}

class PaymentAPI {
  /**
   * Create MOMO payment
   */
  async createMomoPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await apiClient.post<{
      success: boolean
      data: CreatePaymentResponse
      message: string
    }>('/payment/momo/create', {
      bill_id: data.bill_id,
      amount: data.amount,
      orderInfo: data.orderInfo || `Thanh toán hóa đơn #${data.bill_id}`
    })
    return response.data
  }

  /**
   * Create VNPAY payment
   */
  async createVNPayPayment(data: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    const response = await apiClient.post<{
      success: boolean
      data: CreatePaymentResponse
      message: string
    }>('/payment/vnpay/create', {
      bill_id: data.bill_id,
      amount: data.amount,
      orderInfo: data.orderInfo || `Thanh toán hóa đơn #${data.bill_id}`,
      bankCode: data.bankCode
    })
    return response.data
  }

  /**
   * Get payment transaction status
   */
  async getTransactionStatus(transactionCode: string): Promise<PaymentTransaction> {
    const response = await apiClient.get<{
      success: boolean
      data: PaymentTransaction
    }>(`/payment/status/${transactionCode}`)
    return response.data
  }

  /**
   * Get all transactions for a bill
   */
  async getBillTransactions(billId: number): Promise<PaymentTransaction[]> {
    const response = await apiClient.get<{
      success: boolean
      data: PaymentTransaction[]
    }>(`/payment/bill/${billId}`)
    return response.data
  }

  /**
   * Open payment in new window
   */
  openPaymentWindow(paymentUrl: string): Window | null {
    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    return window.open(
      paymentUrl,
      'payment_window',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
    )
  }

  /**
   * Redirect to payment page
   */
  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl
  }
}

export const paymentApi = new PaymentAPI()
