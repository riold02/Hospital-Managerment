"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { billingApi, type BillingDetail } from "@/lib/api/billing-api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
};

export default function BillPrintPage() {
  const params = useParams();
  const billId = params.id as string;
  const [billing, setBilling] = useState<BillingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (billId) {
      fetchBillingDetail();
    }
  }, [billId]);

  const fetchBillingDetail = async () => {
    try {
      const data = await billingApi.getBillingById(Number(billId));
      setBilling(data);
      setLoading(false);
      
      // Auto print after data loaded
      setTimeout(() => {
        window.print();
      }, 500);
    } catch (err: any) {
      console.error("Error fetching billing:", err);
      setError(err.message || "Không thể tải thông tin hóa đơn");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (error || !billing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-xl font-semibold mb-2">Lỗi</p>
          <p>{error || "Không tìm thấy hóa đơn"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-container">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }

        .print-container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
          background: white;
          font-family: 'Times New Roman', serif;
        }

        .print-header {
          text-align: center;
          border-bottom: 3px double #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }

        .print-title {
          font-size: 24px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 10px 0;
        }

        .print-section {
          margin-bottom: 20px;
        }

        .print-section-title {
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
          margin-bottom: 10px;
          padding: 5px 0;
          border-bottom: 1px solid #333;
        }

        .info-row {
          display: flex;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .info-label {
          font-weight: bold;
          width: 150px;
          flex-shrink: 0;
        }

        .info-value {
          flex: 1;
        }

        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 13px;
        }

        .print-table th {
          background-color: #f0f0f0;
          border: 1px solid #000;
          padding: 8px;
          text-align: center;
          font-weight: bold;
        }

        .print-table td {
          border: 1px solid #000;
          padding: 8px;
        }

        .text-right {
          text-align: right;
        }

        .text-center {
          text-align: center;
        }

        .total-row {
          background-color: #f9f9f9;
          font-weight: bold;
          font-size: 15px;
        }

        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          page-break-inside: avoid;
        }

        .signature-box {
          text-align: center;
          width: 45%;
        }

        .signature-title {
          font-weight: bold;
          margin-bottom: 60px;
        }

        .signature-name {
          font-style: italic;
        }

        .footer-note {
          margin-top: 20px;
          font-size: 12px;
          font-style: italic;
          text-align: center;
          page-break-inside: avoid;
        }

        .payment-status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
        }

        .status-paid {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-pending {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }

        .status-cancelled {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>

      <div className="print-header">
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          BỆNH VIỆN ĐA KHOA TRUNG ƯƠNG
        </div>
        <div style={{ fontSize: '13px', marginTop: '5px' }}>
          Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
        </div>
        <div style={{ fontSize: '13px' }}>
          ĐT: (028) 1234 5678 | Email: info@hospital.vn
        </div>
        <div className="print-title" style={{ marginTop: '15px' }}>
          HÓA ĐƠN VIỆN PHÍ
        </div>
        <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
          Số: {billing.bill_id} - Ngày:{" "}
          {format(
            new Date(billing.billing_date || billing.created_at),
            "dd/MM/yyyy",
            { locale: vi }
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="print-section">
        <div className="print-section-title">I. THÔNG TIN BỆNH NHÂN</div>
        <div className="info-row">
          <div className="info-label">Họ và tên:</div>
          <div className="info-value">{billing.patient.name}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Mã bệnh nhân:</div>
          <div className="info-value">{billing.patient.patient_id}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Ngày sinh:</div>
          <div className="info-value">
            {format(new Date(billing.patient.date_of_birth), "dd/MM/yyyy")}
          </div>
        </div>
        <div className="info-row">
          <div className="info-label">Giới tính:</div>
          <div className="info-value">
            {billing.patient.gender === "MALE"
              ? "Nam"
              : billing.patient.gender === "FEMALE"
              ? "Nữ"
              : "Khác"}
          </div>
        </div>
        {billing.patient.phone && (
          <div className="info-row">
            <div className="info-label">Số điện thoại:</div>
            <div className="info-value">{billing.patient.phone}</div>
          </div>
        )}
        {billing.patient.address && (
          <div className="info-row">
            <div className="info-label">Địa chỉ:</div>
            <div className="info-value">{billing.patient.address}</div>
          </div>
        )}
      </div>

      {/* Medical Record Information */}
      {billing.medical_record && (
        <div className="print-section">
          <div className="print-section-title">II. THÔNG TIN KHÁM BỆNH</div>
          <div className="info-row">
            <div className="info-label">Mã hồ sơ:</div>
            <div className="info-value">{billing.medical_record.record_id}</div>
          </div>
          <div className="info-row">
            <div className="info-label">Bác sĩ điều trị:</div>
            <div className="info-value">
              {billing.medical_record.doctor?.user?.full_name || "N/A"}
            </div>
          </div>
          <div className="info-row">
            <div className="info-label">Chẩn đoán:</div>
            <div className="info-value">{billing.medical_record.diagnosis}</div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="print-section">
        <div className="print-section-title">
          III. CHI TIẾT DỊCH VỤ ({billing.items?.length || 0})
        </div>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: "40px" }}>STT</th>
              <th>Tên dịch vụ</th>
              <th style={{ width: "60px" }}>SL</th>
              <th style={{ width: "120px" }}>Đơn giá (VNĐ)</th>
              <th style={{ width: "140px" }}>Thành tiền (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {billing.items?.map((item, index) => (
              <tr key={item.item_id}>
                <td className="text-center">{index + 1}</td>
                <td>
                  <div style={{ fontWeight: "500" }}>
                    {item.service?.service_name || item.item_description}
                  </div>
                  {item.service?.description && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#666",
                        marginTop: "3px",
                      }}
                    >
                      {item.service.description}
                    </div>
                  )}
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-right">{formatCurrency(item.unit_price)}</td>
                <td className="text-right">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan={4} className="text-right" style={{ padding: "12px" }}>
                TỔNG CỘNG:
              </td>
              <td className="text-right" style={{ fontSize: "16px" }}>
                {formatCurrency(billing.total_amount)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Payment Information */}
      <div className="print-section">
        <div className="print-section-title">IV. THÔNG TIN THANH TOÁN</div>
        <div className="info-row">
          <div className="info-label">Trạng thái:</div>
          <div className="info-value">
            <span
              className={`payment-status ${
                billing.payment_status?.toUpperCase() === "PAID"
                  ? "status-paid"
                  : billing.payment_status?.toUpperCase() === "PENDING"
                  ? "status-pending"
                  : "status-cancelled"
              }`}
            >
              {billing.payment_status?.toUpperCase() === "PAID"
                ? "ĐÃ THANH TOÁN"
                : billing.payment_status?.toUpperCase() === "PENDING"
                ? "ĐANG CHỜ"
                : billing.payment_status?.toUpperCase() === "OVERDUE"
                ? "QUÁ HẠN"
                : "ĐÃ HỦY"}
            </span>
          </div>
        </div>
        <div className="info-row">
          <div className="info-label">Phương thức:</div>
          <div className="info-value">
            {billing.payment_method === "CASH"
              ? "Tiền mặt"
              : billing.payment_method === "BANK_TRANSFER"
              ? "Chuyển khoản"
              : billing.payment_method === "MOMO"
              ? "Ví MOMO"
              : billing.payment_method === "VNPAY"
              ? "VNPAY"
              : billing.payment_method || "N/A"}
          </div>
        </div>

        {/* Payment Transactions */}
        {billing.payment_transactions &&
          billing.payment_transactions.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  marginBottom: "8px",
                }}
              >
                Lịch sử giao dịch:
              </div>
              {billing.payment_transactions.map((trans: any, index: number) => (
                <div
                  key={trans.transaction_id}
                  style={{
                    fontSize: "12px",
                    marginBottom: "5px",
                    paddingLeft: "10px",
                  }}
                >
                  {index + 1}. Mã GD: {trans.transaction_code} - Cổng:{" "}
                  {trans.payment_gateway} - Trạng thái:{" "}
                  {trans.status === "SUCCESS"
                    ? "Đã thanh toán"
                    : trans.status === "PENDING"
                    ? "Đang chờ"
                    : trans.status === "FAILED"
                    ? "Thất bại"
                    : trans.status === "CANCELLED"
                    ? "Đã hủy"
                    : trans.status}{" "}
                  - Số tiền: {formatCurrency(trans.amount)}
                  {trans.paid_at && (
                    <span>
                      {" "}
                      - Thanh toán:{" "}
                      {format(
                        new Date(trans.paid_at),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

        {/* Payment Instructions for Pending Bills */}
        {billing.payment_status === "PENDING" && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#fffbea",
              border: "1px solid #ffd54f",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              Hướng dẫn thanh toán:
            </div>
            <div>
              • Quý khách vui lòng thanh toán tại quầy thu ngân hoặc qua cổng
              thanh toán điện tử
            </div>
            <div>• Vui lòng giữ hóa đơn này để đối chiếu khi cần thiết</div>
            <div>• Mọi thắc mắc vui lòng liên hệ: (028) 1234 5678</div>
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-title">
            {format(new Date(), "dd/MM/yyyy", { locale: vi })}
            <br />
            Người lập phiếu
          </div>
          <div className="signature-name">(Ký và ghi rõ họ tên)</div>
        </div>
        <div className="signature-box">
          <div className="signature-title">
            Kế toán
          </div>
          <div className="signature-name">(Ký và ghi rõ họ tên)</div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer-note">
        <div>
          Hóa đơn này là chứng từ hợp pháp để thanh toán viện phí và yêu cầu
          bồi thường bảo hiểm (nếu có)
        </div>
        <div style={{ marginTop: "5px" }}>
          Cảm ơn quý khách đã sử dụng dịch vụ của Bệnh viện!
        </div>
      </div>

      {/* Print Button (only visible on screen) */}
      <div className="no-print" style={{ textAlign: "center", marginTop: "30px" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 24px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🖨️ In hóa đơn
        </button>
        <button
          onClick={() => window.close()}
          style={{
            padding: "10px 24px",
            fontSize: "16px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          ✖️ Đóng
        </button>
      </div>
    </div>
  );
}
