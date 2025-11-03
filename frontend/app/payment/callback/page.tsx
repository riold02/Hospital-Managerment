'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from 'lucide-react'
import { paymentApi, PaymentTransaction } from '@/lib/api/payment-api'

function PaymentCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get transaction code from URL params
        // MOMO: orderId
        // VNPAY: vnp_TxnRef
        const momoOrderId = searchParams.get('orderId')
        const vnpayTxnRef = searchParams.get('vnp_TxnRef')
        const transactionCode = momoOrderId || vnpayTxnRef

        if (!transactionCode) {
          setError('Không tìm thấy mã giao dịch')
          setLoading(false)
          return
        }

        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Get transaction status
        const result = await paymentApi.getTransactionStatus(transactionCode)
        setTransaction(result)
      } catch (err: any) {
        setError(err.message || 'Không thể kiểm tra trạng thái thanh toán')
      } finally {
        setLoading(false)
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const getStatusInfo = () => {
    if (!transaction) return null

    switch (transaction.status) {
      case 'SUCCESS':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-green-500" />,
          title: 'Thanh toán thành công!',
          description: 'Giao dịch của bạn đã được xử lý thành công',
          color: 'text-green-600'
        }
      case 'FAILED':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Thanh toán thất bại',
          description: 'Giao dịch không thành công. Vui lòng thử lại',
          color: 'text-red-600'
        }
      case 'CANCELLED':
        return {
          icon: <XCircle className="w-16 h-16 text-gray-500" />,
          title: 'Đã hủy thanh toán',
          description: 'Bạn đã hủy giao dịch',
          color: 'text-gray-600'
        }
      default:
        return {
          icon: <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />,
          title: 'Đang xử lý...',
          description: 'Vui lòng đợi trong giây lát',
          color: 'text-blue-600'
        }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p className="text-lg font-medium">Đang kiểm tra kết quả thanh toán...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <XCircle className="w-16 h-16 text-red-500" />
              <h2 className="text-2xl font-bold text-red-600">Có lỗi xảy ra</h2>
              <p className="text-muted-foreground text-center">{error}</p>
              <Button onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang chủ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo()

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Kết quả thanh toán</CardTitle>
          <CardDescription>
            Thông tin chi tiết về giao dịch của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Icon and Title */}
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {statusInfo?.icon}
            <h2 className={`text-2xl font-bold ${statusInfo?.color}`}>
              {statusInfo?.title}
            </h2>
            <p className="text-muted-foreground text-center">
              {statusInfo?.description}
            </p>
          </div>

          {/* Transaction Details */}
          {transaction && (
            <div className="space-y-4 mt-8">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mã giao dịch</span>
                  <span className="font-mono font-medium">{transaction.transaction_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Số tiền</span>
                  <span className="font-bold text-lg">{formatCurrency(Number(transaction.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phương thức</span>
                  <span className="font-medium">{transaction.payment_gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Thời gian</span>
                  <span className="font-medium">
                    {new Date(transaction.created_at).toLocaleString('vi-VN')}
                  </span>
                </div>
                {transaction.gateway_transaction_id && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mã GD cổng thanh toán</span>
                    <span className="font-mono text-sm">{transaction.gateway_transaction_id}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/billing')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Xem hóa đơn
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1"
                >
                  Về trang chủ
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
              <p className="text-lg font-medium">Đang tải...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  )
}
