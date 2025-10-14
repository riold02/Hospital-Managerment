"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Receipt,
  Printer,
  CreditCard,
  User,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { billingApi, type BillingDetail } from "@/lib/api/billing-api";
import { PaymentModal } from "./PaymentModal";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface BillDetailModalProps {
  billId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

const getStatusBadge = (status: string) => {
  // Support both UPPERCASE and PascalCase
  const upperStatus = status.toUpperCase();
  
  switch (upperStatus) {
    case "PAID":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Đã thanh toán
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Clock className="w-3 h-3 mr-1" />
          Đang chờ
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          <XCircle className="w-3 h-3 mr-1" />
          Quá hạn
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <XCircle className="w-3 h-3 mr-1" />
          Đã hủy
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
    case "CASH":
      return "Tiền mặt";
    case "BANK_TRANSFER":
      return "Chuyển khoản";
    case "MOMO":
      return "Ví MOMO";
    case "VNPAY":
      return "VNPAY";
    default:
      return method;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-xs">
          Đã thanh toán
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
          Đang chờ
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-xs">Thất bại</Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600 text-xs">Đã hủy</Badge>
      );
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
};

export function BillDetailModal({
  billId,
  open,
  onOpenChange,
}: BillDetailModalProps) {
  const [billing, setBilling] = useState<BillingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [confirmingCash, setConfirmingCash] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && billId) {
      fetchBillingDetail();
    }
  }, [open, billId]);

  const fetchBillingDetail = async () => {
    if (!billId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await billingApi.getBillingById(billId);
      setBilling(data);
    } catch (err: any) {
      console.error("Error fetching billing detail:", err);
      setError(err.message || "Không thể tải thông tin hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Open print view in new window
    const printWindow = window.open(
      `/billing/print/${billId}`,
      "_blank",
      "width=800,height=600"
    );
    if (printWindow) {
      printWindow.focus();
    }
  };

  const handleConfirmCashPayment = async () => {
    if (!billing) return;

    try {
      setConfirmingCash(true);
      
      await billingApi.updateBilling(billing.bill_id, {
        payment_status: "PAID",
        payment_date: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Thành công",
        description: "Đã xác nhận thanh toán tiền mặt",
      });

      fetchBillingDetail();
    } catch (err: any) {
      console.error("Error confirming cash payment:", err);
      toast({
        title: "Lỗi",
        description: err.message || "Không thể xác nhận thanh toán",
        variant: "destructive",
      });
    } finally {
      setConfirmingCash(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Refresh billing data after payment
    fetchBillingDetail();
    setPaymentModalOpen(false);
  };

  if (!billId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Receipt className="w-6 h-6" />
              Chi tiết hóa đơn #{billId}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
              {error}
            </div>
          )}

          {billing && (
            <div className="space-y-6">
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Thông tin bệnh nhân
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Họ tên:</span>
                    <span className="ml-2 font-medium">{billing.patient.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã BN:</span>
                    <span className="ml-2 font-medium">
                      {billing.patient.patient_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Giới tính:</span>
                    <span className="ml-2">
                      {billing.patient.gender === "MALE"
                        ? "Nam"
                        : billing.patient.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày sinh:</span>
                    <span className="ml-2">
                      {format(
                        new Date(billing.patient.date_of_birth),
                        "dd/MM/yyyy"
                      )}
                    </span>
                  </div>
                  {billing.patient.phone && (
                    <div>
                      <span className="text-gray-600">SĐT:</span>
                      <span className="ml-2">{billing.patient.phone}</span>
                    </div>
                  )}
                  {billing.patient.address && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Địa chỉ:</span>
                      <span className="ml-2">{billing.patient.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Record Information */}
              {billing.medical_record && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Thông tin khám bệnh
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Mã hồ sơ:</span>
                      <span className="ml-2 font-medium">
                        {billing.medical_record.record_id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bác sĩ điều trị:</span>
                      <span className="ml-2 font-medium">
                        {billing.medical_record.doctor?.user?.full_name || "N/A"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Chẩn đoán:</span>
                      <span className="ml-2">{billing.medical_record.diagnosis}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Information */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Thông tin hóa đơn
                  </h3>
                  {getStatusBadge(billing.payment_status)}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Mã hóa đơn:</span>
                    <span className="ml-2 font-medium">{billing.bill_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="ml-2">
                      {format(
                        new Date(billing.billing_date || billing.created_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phương thức:</span>
                    <span className="ml-2">
                      {getPaymentMethodLabel(billing.payment_method || "N/A")}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Services/Items Table */}
              <div>
                <h3 className="font-semibold text-lg mb-3">
                  Chi tiết dịch vụ ({billing.items?.length || 0})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left p-3 font-semibold">STT</th>
                        <th className="text-left p-3 font-semibold">Dịch vụ</th>
                        <th className="text-center p-3 font-semibold">SL</th>
                        <th className="text-right p-3 font-semibold">Đơn giá</th>
                        <th className="text-right p-3 font-semibold">
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.items?.map((item, index) => (
                        <tr key={item.item_id} className="border-t">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <div className="font-medium">
                              {item.service?.service_name || item.item_description}
                            </div>
                            {item.service?.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.service.description}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="p-3 text-right font-medium">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan={4} className="p-3 text-right font-semibold">
                          Tổng cộng:
                        </td>
                        <td className="p-3 text-right font-bold text-lg text-primary">
                          {formatCurrency(billing.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Transactions */}
              {billing.payment_transactions &&
                billing.payment_transactions.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Lịch sử thanh toán ({billing.payment_transactions.length})
                    </h3>
                    <div className="space-y-2">
                      {billing.payment_transactions.map((transaction) => (
                        <div
                          key={transaction.transaction_id}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  Mã GD: {transaction.transaction_code}
                                </span>
                                {getPaymentStatusBadge(transaction.status)}
                              </div>
                              <div className="text-gray-600">
                                Cổng thanh toán:{" "}
                                <span className="font-medium">
                                  {transaction.payment_gateway}
                                </span>
                              </div>
                              <div className="text-gray-600">
                                Số tiền:{" "}
                                <span className="font-medium text-primary">
                                  {formatCurrency(transaction.amount)}
                                </span>
                              </div>
                              <div className="text-gray-600 text-xs">
                                Ngày tạo:{" "}
                                {format(
                                  new Date(transaction.created_at),
                                  "dd/MM/yyyy HH:mm:ss",
                                  { locale: vi }
                                )}
                              </div>
                              {transaction.paid_at && (
                                <div className="text-gray-600 text-xs">
                                  Thanh toán lúc:{" "}
                                  {format(
                                    new Date(transaction.paid_at),
                                    "dd/MM/yyyy HH:mm:ss",
                                    { locale: vi }
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  In hóa đơn
                </Button>
                {billing.payment_status === "PENDING" && billing.payment_method === "CASH" && (
                  <Button 
                    onClick={handleConfirmCashPayment}
                    disabled={confirmingCash}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {confirmingCash ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                  </Button>
                )}
                {billing.payment_status === "PENDING" && billing.payment_method !== "CASH" && (
                  <Button onClick={() => setPaymentModalOpen(true)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Thanh toán ngay
                  </Button>
                )}
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {billing && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          billId={billing.bill_id}
          amount={parseFloat(billing.total_amount)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
