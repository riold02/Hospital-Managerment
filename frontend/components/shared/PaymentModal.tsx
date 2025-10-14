'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Wallet, CreditCard, Smartphone } from 'lucide-react'
import { paymentApi, PaymentGateway } from '@/lib/api/payment-api'
import { useToast } from '@/hooks/use-toast'

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  billId: number
  amount: number
  onSuccess?: () => void
}

export function PaymentModal({
  open,
  onOpenChange,
  billId,
  amount,
  onSuccess
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentGateway>('MOMO')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value)
  }

  const handlePayment = async () => {
    try {
      setLoading(true)

      let result
      if (paymentMethod === 'MOMO') {
        result = await paymentApi.createMomoPayment({
          bill_id: billId,
          amount: amount,
          orderInfo: `Thanh toán viện phí #${billId}`
        })
      } else if (paymentMethod === 'VNPAY') {
        result = await paymentApi.createVNPayPayment({
          bill_id: billId,
          amount: amount,
          orderInfo: `Thanh toán viện phí #${billId}`
        })
      } else {
        // Cash payment - handle differently
        toast({
          title: "Thanh toán tiền mặt",
          description: "Vui lòng thanh toán tại quầy thu ngân"
        })
        onOpenChange(false)
        return
      }

      if (result.paymentUrl) {
        toast({
          title: "Chuyển đến trang thanh toán",
          description: `Mã giao dịch: ${result.transactionCode}`
        })

        // Redirect to payment page
        paymentApi.redirectToPayment(result.paymentUrl)
        
        // Or open in new window (uncomment if preferred)
        // const paymentWindow = paymentApi.openPaymentWindow(result.paymentUrl)
        // if (!paymentWindow) {
        //   toast({
        //     title: "Lỗi",
        //     description: "Không thể mở cửa sổ thanh toán. Vui lòng cho phép popup.",
        //     variant: "destructive"
        //   })
        // }
        
        onOpenChange(false)
        if (onSuccess) onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo thanh toán",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chọn phương thức thanh toán</DialogTitle>
          <DialogDescription>
            Vui lòng chọn phương thức thanh toán phù hợp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Display */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Số tiền cần thanh toán</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(amount)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentGateway)}
            className="space-y-3"
          >
            {/* MOMO */}
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="MOMO" id="momo" />
              <Label htmlFor="momo" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Ví MoMo</p>
                  <p className="text-sm text-muted-foreground">Thanh toán qua ví điện tử MoMo</p>
                </div>
              </Label>
            </div>

            {/* VNPAY */}
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="VNPAY" id="vnpay" />
              <Label htmlFor="vnpay" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">VNPAY</p>
                  <p className="text-sm text-muted-foreground">Thanh toán qua cổng VNPAY</p>
                </div>
              </Label>
            </div>

            {/* Cash */}
            <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-accent transition-colors">
              <RadioGroupItem value="CASH" id="cash" />
              <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Tiền mặt</p>
                  <p className="text-sm text-muted-foreground">Thanh toán tại quầy thu ngân</p>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Thanh toán
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
