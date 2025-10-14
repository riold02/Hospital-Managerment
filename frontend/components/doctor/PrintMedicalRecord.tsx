"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Printer, X } from "lucide-react"

interface PrintMedicalRecordProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientData: {
    patient_name?: string
    patient_info?: {
      patient_id?: number
      patient_code?: string
      first_name?: string
      last_name?: string
      date_of_birth?: string
      gender?: string
      phone?: string
      address?: string
      allergies?: string
      blood_type?: string
    }
    patient_id?: number
    appointment_date?: string
    appointment_time?: string
  }
  clinicalNotes: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  orders: Array<{
    id: string
    type: string
    test: string
    priority: string
  }>
  prescriptions: Array<{
    id: string
    medicine_name?: string
    medication?: string
    quantity: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }>
  doctorInfo?: {
    name?: string
    title?: string
    department?: string
  }
}

const PrintMedicalRecord = ({
  open,
  onOpenChange,
  patientData,
  clinicalNotes,
  orders,
  prescriptions,
  doctorInfo,
}: PrintMedicalRecordProps) => {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Hồ Sơ Khám Bệnh</title>
              <meta charset="UTF-8">
              <style>
                @page {
                  size: A4;
                  margin: 15mm 20mm;
                }
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  font-family: 'Times New Roman', 'Arial', serif;
                  font-size: 13pt;
                  line-height: 1.5;
                  color: #000;
                  padding: 15px;
                  background: white;
                }
                .header {
                  text-align: center;
                  margin-bottom: 25px;
                  padding-bottom: 12px;
                  border-bottom: 3px double #000;
                }
                .hospital-info {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 15px;
                }
                .hospital-left, .hospital-right {
                  flex: 1;
                }
                .hospital-left {
                  text-align: left;
                  font-size: 11pt;
                  line-height: 1.4;
                }
                .hospital-right {
                  text-align: right;
                  font-size: 11pt;
                  line-height: 1.4;
                }
                .hospital-name {
                  font-size: 14pt;
                  font-weight: bold;
                  text-transform: uppercase;
                }
                .title {
                  font-size: 18pt;
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  color: #1a472a;
                  margin: 15px 0 10px 0;
                }
                .section {
                  margin-bottom: 18px;
                  page-break-inside: avoid;
                }
                .section-title {
                  font-size: 14pt;
                  font-weight: bold;
                  margin-bottom: 8px;
                  padding: 5px 10px;
                  background-color: #e8f5e9;
                  border-left: 4px solid #2e7d32;
                  color: #1b5e20;
                }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 8px;
                  margin-bottom: 8px;
                }
                .info-item {
                  font-size: 12pt;
                  padding: 3px 0;
                }
                .label {
                  font-weight: bold;
                  display: inline-block;
                  min-width: 110px;
                }
                .value {
                  display: inline-block;
                }
                .info-full {
                  grid-column: 1 / -1;
                }
                .content {
                  white-space: pre-wrap;
                  padding: 8px 15px;
                  background-color: #fafafa;
                  border-radius: 4px;
                  margin-top: 5px;
                  text-align: justify;
                  line-height: 1.6;
                  font-size: 12pt;
                }
                .content-label {
                  font-weight: bold;
                  color: #2e7d32;
                  margin-bottom: 5px;
                  font-size: 12pt;
                }
                .prescription-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 10px;
                  font-size: 11pt;
                }
                .prescription-table th {
                  background: linear-gradient(to bottom, #4caf50, #388e3c);
                  color: white;
                  padding: 10px 8px;
                  text-align: left;
                  font-weight: bold;
                  border: 1px solid #2e7d32;
                }
                .prescription-table td {
                  border: 1px solid #999;
                  padding: 8px;
                  vertical-align: top;
                }
                .prescription-table tbody tr:nth-child(even) {
                  background-color: #f5f5f5;
                }
                .prescription-table tbody tr:hover {
                  background-color: #e8f5e9;
                }
                .orders-list {
                  list-style-position: inside;
                  padding-left: 10px;
                }
                .orders-list li {
                  margin: 8px 0;
                  padding: 8px;
                  background-color: #f5f5f5;
                  border-left: 3px solid #4caf50;
                  font-size: 12pt;
                }
                .orders-list li strong {
                  color: #1b5e20;
                }
                .footer {
                  margin-top: 35px;
                  display: flex;
                  justify-content: space-between;
                  page-break-inside: avoid;
                }
                .signature {
                  text-align: center;
                  width: 45%;
                }
                .signature-date {
                  font-style: italic;
                  margin-bottom: 10px;
                  font-size: 11pt;
                }
                .signature-role {
                  font-weight: bold;
                  margin-bottom: 50px;
                  font-size: 12pt;
                }
                .signature-name {
                  font-weight: bold;
                  text-decoration: underline;
                  font-size: 12pt;
                }
                .warning-box {
                  background: linear-gradient(to right, #fff3cd, #fffaeb);
                  border: 2px solid #ff9800;
                  border-left: 5px solid #f44336;
                  padding: 12px;
                  margin: 12px 0;
                  border-radius: 5px;
                  font-size: 12pt;
                }
                .warning-box strong {
                  color: #d32f2f;
                  font-size: 13pt;
                }
                .empty-state {
                  text-align: center;
                  padding: 20px;
                  color: #666;
                  font-style: italic;
                  background-color: #f5f5f5;
                  border-radius: 5px;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                  .section {
                    page-break-inside: avoid;
                  }
                  .prescription-table {
                    page-break-inside: auto;
                  }
                  .prescription-table tr {
                    page-break-inside: avoid;
                  }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        
        // Delay print to allow styles to load
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 250)
      }
    }
  }

  const getGenderDisplay = (gender?: string) => {
    if (!gender) return "Chưa xác định"
    const genderLower = gender.toLowerCase()
    if (genderLower === "male" || genderLower === "m" || genderLower === "nam") return "Nam"
    if (genderLower === "female" || genderLower === "f" || genderLower === "nữ") return "Nữ"
    if (genderLower === "other" || genderLower === "o" || genderLower === "khác") return "Khác"
    return gender
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A"
    if (typeof timeString === "string" && timeString.includes(":")) {
      const parts = timeString.split(":")
      return `${parts[0]}:${parts[1]}`
    }
    return timeString
  }

  const patientName = patientData.patient_name || 
    `${patientData.patient_info?.first_name || ''} ${patientData.patient_info?.last_name || ''}`.trim() ||
    "Không có tên"

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>In Hồ Sơ Khám Bệnh</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 mr-2" />
                In hồ sơ
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="p-6 bg-white text-black">
          {/* Header */}
          <div className="header">
            <div className="hospital-info">
              <div className="hospital-left">
                <div className="hospital-name">BỆNH VIỆN ĐA KHOA</div>
                <div>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</div>
                <div>ĐT: (028) 1234 5678 | Email: info@hospital.vn</div>
              </div>
              <div className="hospital-right">
                <div><strong>Mã BN:</strong> {patientData.patient_info?.patient_code || patientData.patient_info?.patient_id || patientData.patient_id || 'N/A'}</div>
                <div><strong>Ngày khám:</strong> {formatDate(patientData.appointment_date)}</div>
              </div>
            </div>
            <div className="title">HỒ SƠ KHÁM BỆNH</div>
          </div>

          {/* Patient Information */}
          <div className="section">
            <div className="section-title">I. THÔNG TIN BỆNH NHÂN</div>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Họ và tên:</span>
                <span className="value">{patientName}</span>
              </div>
              <div className="info-item">
                <span className="label">Giới tính:</span>
                <span className="value">{getGenderDisplay(patientData.patient_info?.gender)}</span>
              </div>
              <div className="info-item">
                <span className="label">Ngày sinh:</span>
                <span className="value">{formatDate(patientData.patient_info?.date_of_birth)}</span>
              </div>
              <div className="info-item">
                <span className="label">Nhóm máu:</span>
                <span className="value">{patientData.patient_info?.blood_type || 'Chưa xác định'}</span>
              </div>
              <div className="info-item">
                <span className="label">Điện thoại:</span>
                <span className="value">{patientData.patient_info?.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Giờ khám:</span>
                <span className="value">{formatTime(patientData.appointment_time)}</span>
              </div>
              <div className="info-item info-full">
                <span className="label">Địa chỉ:</span>
                <span className="value">{patientData.patient_info?.address || 'Chưa có thông tin'}</span>
              </div>
            </div>
            {patientData.patient_info?.allergies && (
              <div className="warning-box" style={{ marginTop: '12px' }}>
                <strong>⚠️ CẢNH BÁO DỊ ỨNG:</strong> {patientData.patient_info.allergies}
              </div>
            )}
          </div>

          {/* SOAP Notes */}
          <div className="section">
            <div className="section-title">II. THÔNG TIN KHÁM BỆNH (SOAP)</div>
            
            {clinicalNotes.subjective && (
              <div style={{ marginBottom: '12px' }}>
                <div className="content-label">📋 Triệu chứng chủ quan (Subjective):</div>
                <div className="content">{clinicalNotes.subjective}</div>
              </div>
            )}

            {clinicalNotes.objective && (
              <div style={{ marginBottom: '12px' }}>
                <div className="content-label">🩺 Khám lâm sàng (Objective):</div>
                <div className="content">{clinicalNotes.objective}</div>
              </div>
            )}

            {clinicalNotes.assessment && (
              <div style={{ marginBottom: '12px' }}>
                <div className="content-label">🔍 Chẩn đoán (Assessment):</div>
                <div className="content">{clinicalNotes.assessment}</div>
              </div>
            )}

            {clinicalNotes.plan && (
              <div style={{ marginBottom: '12px' }}>
                <div className="content-label">📝 Kế hoạch điều trị (Plan):</div>
                <div className="content">{clinicalNotes.plan}</div>
              </div>
            )}

            {!clinicalNotes.subjective && !clinicalNotes.objective && !clinicalNotes.assessment && !clinicalNotes.plan && (
              <div className="empty-state">Chưa có thông tin khám bệnh</div>
            )}
          </div>

          {/* Orders */}
          {orders.length > 0 && (
            <div className="section">
              <div className="section-title">III. CHỈ ĐỊNH CẬN LÂM SÀNG</div>
              <ol className="orders-list">
                {orders.map((order, index) => (
                  <li key={order.id}>
                    <strong>{order.test}</strong>
                    <span style={{ color: '#666' }}> - 
                      {order.type === 'lab' && ' Xét nghiệm'}
                      {order.type === 'imaging' && ' Chẩn đoán hình ảnh'}
                      {order.type === 'procedure' && ' Thủ thuật'}
                      {order.type === 'consultation' && ' Hội chẩn'}
                      {' '}({order.priority === 'routine' ? 'Thường quy' : 
                             order.priority === 'urgent' ? 'Khẩn cấp' : 'Cấp cứu'})
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Prescriptions */}
          {prescriptions.length > 0 ? (
            <div className="section">
              <div className="section-title">IV. ĐƠN THUỐC</div>
              <table className="prescription-table">
                <thead>
                  <tr>
                    <th style={{ width: '5%', textAlign: 'center' }}>STT</th>
                    <th style={{ width: '28%' }}>Tên thuốc</th>
                    <th style={{ width: '12%', textAlign: 'center' }}>Liều lượng</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>SL</th>
                    <th style={{ width: '15%' }}>Tần suất</th>
                    <th style={{ width: '32%' }}>Hướng dẫn sử dụng</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map((rx, index) => (
                    <tr key={rx.id}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{index + 1}</td>
                      <td style={{ fontWeight: '600' }}>{rx.medicine_name || rx.medication || 'Không có tên'}</td>
                      <td style={{ textAlign: 'center' }}>{rx.dosage || '-'}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{rx.quantity || '-'}</td>
                      <td>{rx.frequency || '-'}</td>
                      <td>{rx.instructions || rx.duration || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f0f7ff', border: '1px solid #2196f3', borderRadius: '4px', fontSize: '11pt' }}>
                <strong>📌 Lưu ý:</strong> Uống thuốc đúng liều lượng và thời gian. Không tự ý ngừng thuốc khi chưa hết đợt điều trị.
              </div>
            </div>
          ) : (
            <div className="section">
              <div className="section-title">IV. ĐƠN THUỐC</div>
              <div className="empty-state">Không có đơn thuốc</div>
            </div>
          )}

          {/* Footer with signatures */}
          <div className="footer">
            <div className="signature">
              <div className="signature-date">
                {currentDate}
              </div>
              <div className="signature-role">NGƯỜI BỆNH / NGƯỜI NHÀ</div>
              <div className="signature-name">(Ký và ghi rõ họ tên)</div>
            </div>
            <div className="signature">
              <div className="signature-date">
                {currentDate}
              </div>
              <div className="signature-role">BÁC SĨ KHÁM BỆNH</div>
              <div className="signature-name">
                {doctorInfo?.name || 'BS. [Tên bác sĩ]'}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PrintMedicalRecord
