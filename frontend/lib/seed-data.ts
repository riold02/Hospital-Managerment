export interface Patient {
  id: number
  first_name: string
  last_name: string
  full_name: string
  date_of_birth: string
  gender: "M" | "F" | "O"
  contact_number: string
  email: string
  address: string
  medical_history: string
  created_at: string
}

export interface Doctor {
  id: number
  first_name: string
  last_name: string
  full_name: string
  specialty: string
  contact_number: string
  email: string
  available_schedule: string
  created_at: string
}

export interface Medicine {
  id: number
  name: string
  brand: string
  type: "Tablet" | "Capsule" | "Liquid" | "Injection" | "Ointment"
  dosage: string
  stock_quantity: number
  expiry_date: string
  batch_number: string
  supplier: string
  price: number
  created_at: string
}

export interface Room {
  id: number
  room_number: string
  room_type: string
  capacity: number
  status: "Available" | "Occupied" | "Under Maintenance"
  last_serviced: string
  created_at: string
}

export interface Appointment {
  id: number
  patient_id: number
  doctor_id: number
  patient_name: string
  doctor_name: string
  appointment_date: string
  appointment_time: string
  purpose: string
  status: "Scheduled" | "Completed" | "Cancelled" | "In Progress"
  created_at: string
}

export interface MedicalRecord {
  id: number
  patient_id: number
  doctor_id: number
  appointment_id?: number
  patient_name: string
  doctor_name: string
  diagnosis: string
  treatment: string
  prescription: string
  notes?: string
  created_at: string
}

export interface MedicalRecordMedicine {
  id: number
  record_id: number
  medicine_id: number
  medicine_name: string
  dosage: string
  frequency: string
  duration: string
}

export interface PharmacyRecord {
  id: number
  pharmacy_id: string
  medicine_id: number
  patient_id: number
  medicine_name: string
  patient_name: string
  quantity: number
  prescription_date: string
  dispensed_date: string
  status: "Dispensed" | "Pending"
  created_at: string
}

export interface Prescription {
  id: number
  patient_id: number
  doctor_id: number
  patient_name: string
  doctor_name: string
  medication_name: string
  dosage: string
  frequency: string
  duration: string
  notes: string
  status: "Pending" | "Dispensed" | "Cancelled"
  created_at: string
}

export interface RoomAssignment {
  id: number
  room_id: number
  patient_id: number
  staff_id?: number
  room_number: string
  patient_name: string
  staff_name?: string
  assignment_date: string
  end_date?: string
  status: "Active" | "Completed"
  created_at: string
}

export interface CleaningService {
  id: number
  room_id: number
  staff_id: number
  room_number: string
  staff_name: string
  service_date: string
  service_time: string
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  priority: "Low" | "Medium" | "High"
  notes?: string
  created_at: string
}

export interface Bill {
  id: number
  bill_id: string
  patient_id: number
  appointment_id?: number
  patient_name: string
  total_amount: number
  payment_status: "Pending" | "Paid" | "Overdue"
  payment_method?: string
  payment_date?: string
  insurance_provider?: string
  items: BillItem[]
  created_at: string
}

export interface BillItem {
  id: number
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface BloodBank {
  id: number
  blood_id: string
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  stock_quantity: number
  last_updated: string
  expiry_date: string
  donor_info?: string
  created_at: string
}

export interface Ambulance {
  id: number
  ambulance_id: string
  ambulance_number: string
  availability: "Available" | "On Duty" | "Maintenance"
  driver_id?: number
  driver_name?: string
  last_service_date: string
  created_at: string
}

export interface AmbulanceLog {
  id: number
  log_id: string
  ambulance_id: number
  patient_id?: number
  ambulance_number: string
  patient_name?: string
  pickup_location: string
  dropoff_location: string
  pickup_time: string
  dropoff_time?: string
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  notes?: string
  created_at: string
}

// Seed data
export const seedPatients: Patient[] = [
  {
    id: 1,
    first_name: "Nguyễn",
    last_name: "Văn An",
    full_name: "Nguyễn Văn An",
    date_of_birth: "1985-03-15",
    gender: "M",
    contact_number: "0901234567",
    email: "nguyen.van.an@email.com",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    medical_history: "Tiểu đường type 2, cao huyết áp",
    created_at: "2024-01-15T08:30:00Z",
  },
  {
    id: 2,
    first_name: "Trần",
    last_name: "Thị Bình",
    full_name: "Trần Thị Bình",
    date_of_birth: "1990-07-22",
    gender: "F",
    contact_number: "0912345678",
    email: "tran.thi.binh@email.com",
    address: "456 Đường Nguyễn Huệ, Quận 3, TP.HCM",
    medical_history: "Hen suyễn, dị ứng thuốc kháng sinh",
    created_at: "2024-01-16T09:15:00Z",
  },
  // ... more patients
]

export const seedDoctors: Doctor[] = [
  {
    id: 1,
    first_name: "Bác sĩ",
    last_name: "Lê Minh Đức",
    full_name: "BS. Lê Minh Đức",
    specialty: "Tim mạch",
    contact_number: "0987654321",
    email: "bs.le.minh.duc@hospital.com",
    available_schedule: "Thứ 2-6: 8:00-17:00, Thứ 7: 8:00-12:00",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    first_name: "Bác sĩ",
    last_name: "Phạm Thị Hoa",
    full_name: "BS. Phạm Thị Hoa",
    specialty: "Nhi khoa",
    contact_number: "0976543210",
    email: "bs.pham.thi.hoa@hospital.com",
    available_schedule: "Thứ 2-7: 7:30-16:30",
    created_at: "2024-01-01T00:00:00Z",
  },
  // ... more doctors
]

export const seedMedicines: Medicine[] = [
  {
    id: 1,
    name: "Paracetamol",
    brand: "Hapacol",
    type: "Tablet",
    dosage: "500mg",
    stock_quantity: 150,
    expiry_date: "2025-12-31",
    batch_number: "PAR2024001",
    supplier: "Công ty Dược Hà Tây",
    price: 2500,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Amoxicillin",
    brand: "Amoxicillin Stada",
    type: "Capsule",
    dosage: "250mg",
    stock_quantity: 75,
    expiry_date: "2024-06-30",
    batch_number: "AMX2024002",
    supplier: "Stada Vietnam",
    price: 8500,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    name: "Amlodipine",
    brand: "Norvasc",
    type: "Tablet",
    dosage: "5mg",
    stock_quantity: 200,
    expiry_date: "2025-08-15",
    batch_number: "AML2024003",
    supplier: "Pfizer Vietnam",
    price: 12000,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    name: "Insulin",
    brand: "Lantus",
    type: "Injection",
    dosage: "100IU/ml",
    stock_quantity: 25,
    expiry_date: "2024-03-20",
    batch_number: "INS2024004",
    supplier: "Sanofi Vietnam",
    price: 450000,
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    name: "Betadine",
    brand: "Betadine",
    type: "Ointment",
    dosage: "10%",
    stock_quantity: 80,
    expiry_date: "2025-06-30",
    batch_number: "BET2024005",
    supplier: "Mundipharma Vietnam",
    price: 35000,
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const seedRooms: Room[] = [
  {
    id: 1,
    room_number: "101",
    room_type: "Phòng đơn VIP",
    capacity: 1,
    status: "Available",
    last_serviced: "2024-01-20T10:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    room_number: "102",
    room_type: "Phòng đôi",
    capacity: 2,
    status: "Occupied",
    last_serviced: "2024-01-19T14:30:00Z",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    room_number: "103",
    room_type: "Phòng đơn thường",
    capacity: 1,
    status: "Under Maintenance",
    last_serviced: "2024-01-18T09:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    room_number: "201",
    room_type: "Phòng tập thể",
    capacity: 4,
    status: "Available",
    last_serviced: "2024-01-21T15:30:00Z",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 5,
    room_number: "202",
    room_type: "Phòng ICU",
    capacity: 1,
    status: "Occupied",
    last_serviced: "2024-01-22T08:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const seedAppointments: Appointment[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    patient_name: "Nguyễn Văn An",
    doctor_name: "BS. Lê Minh Đức",
    appointment_date: "2024-02-01",
    appointment_time: "10:00",
    purpose: "Theo dõi bệnh lý",
    status: "Scheduled",
    created_at: "2024-01-25T09:30:00Z",
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 2,
    patient_name: "Trần Thị Bình",
    doctor_name: "BS. Phạm Thị Hoa",
    appointment_date: "2024-02-02",
    appointment_time: "11:00",
    purpose: "Chăm sóc sức khỏe",
    status: "Completed",
    created_at: "2024-01-25T10:45:00Z",
  },
  // ... more appointments
]

export const seedMedicalRecords: MedicalRecord[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    appointment_id: 1,
    patient_name: "Nguyễn Văn An",
    doctor_name: "BS. Lê Minh Đức",
    diagnosis: "Tăng huyết áp độ 1, rối loạn lipid máu",
    treatment: "Điều trị nội khoa, thay đổi lối sống",
    prescription: "Amlodipine 5mg x 1 viên/ngày, Atorvastatin 20mg x 1 viên/ngày",
    notes: "Bệnh nhân cần theo dõi huyết áp hàng tuần",
    created_at: "2024-01-25T09:30:00Z",
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 2,
    appointment_id: 2,
    patient_name: "Trần Thị Bình",
    doctor_name: "BS. Phạm Thị Hoa",
    diagnosis: "Viêm họng cấp, sốt",
    treatment: "Kháng sinh, thuốc hạ sốt, nghỉ ngơi",
    prescription: "Amoxicillin 500mg x 3 lần/ngày x 7 ngày",
    notes: "Tái khám sau 1 tuần nếu không khỏi",
    created_at: "2024-01-25T10:45:00Z",
  },
]

export const seedPrescriptions: Prescription[] = [
  {
    id: 1,
    patient_id: 1,
    doctor_id: 1,
    patient_name: "Nguyễn Văn An",
    doctor_name: "BS. Lê Minh Đức",
    medication_name: "Amlodipine",
    dosage: "5mg",
    frequency: "1 lần/ngày",
    duration: "30 ngày",
    notes: "Uống vào buổi sáng sau ăn",
    status: "Pending",
    created_at: "2024-01-25T09:30:00Z",
  },
  {
    id: 2,
    patient_id: 2,
    doctor_id: 2,
    patient_name: "Trần Thị Bình",
    doctor_name: "BS. Phạm Thị Hoa",
    medication_name: "Amoxicillin",
    dosage: "500mg",
    frequency: "3 lần/ngày",
    duration: "7 ngày",
    notes: "Uống sau ăn, uống đủ liều",
    status: "Dispensed",
    created_at: "2024-01-25T10:45:00Z",
  },
]

export const seedPharmacyRecords: PharmacyRecord[] = [
  {
    id: 1,
    pharmacy_id: "PH001",
    medicine_id: 1,
    patient_id: 2,
    medicine_name: "Amoxicillin",
    patient_name: "Trần Thị Bình",
    quantity: 21,
    prescription_date: "2024-01-25",
    dispensed_date: "2024-01-25",
    status: "Dispensed",
    created_at: "2024-01-25T11:00:00Z",
  },
]

export const seedRoomAssignments: RoomAssignment[] = [
  {
    id: 1,
    room_id: 2,
    patient_id: 1,
    staff_id: 1,
    room_number: "102",
    patient_name: "Nguyễn Văn An",
    staff_name: "Y tá Nguyễn Thị Mai",
    assignment_date: "2024-01-20",
    status: "Active",
    created_at: "2024-01-20T08:00:00Z",
  },
  {
    id: 2,
    room_id: 5,
    patient_id: 2,
    staff_id: 2,
    room_number: "202",
    patient_name: "Trần Thị Bình",
    staff_name: "Y tá Lê Văn Hùng",
    assignment_date: "2024-01-21",
    status: "Active",
    created_at: "2024-01-21T10:30:00Z",
  },
]

export const seedCleaningServices: CleaningService[] = [
  {
    id: 1,
    room_id: 1,
    staff_id: 1,
    room_number: "101",
    staff_name: "Nhân viên vệ sinh Phạm Văn Tùng",
    service_date: "2024-01-25",
    service_time: "08:00",
    status: "Completed",
    priority: "Medium",
    notes: "Vệ sinh tổng quát, thay ga giường",
    created_at: "2024-01-24T16:00:00Z",
  },
  {
    id: 2,
    room_id: 3,
    staff_id: 2,
    room_number: "103",
    staff_name: "Nhân viên vệ sinh Trần Thị Lan",
    service_date: "2024-01-25",
    service_time: "14:00",
    status: "Scheduled",
    priority: "High",
    notes: "Vệ sinh sau bảo trì, khử trùng đặc biệt",
    created_at: "2024-01-24T17:00:00Z",
  },
  {
    id: 3,
    room_id: 4,
    staff_id: 1,
    room_number: "201",
    staff_name: "Nhân viên vệ sinh Phạm Văn Tùng",
    service_date: "2024-01-25",
    service_time: "10:30",
    status: "In Progress",
    priority: "Low",
    notes: "Vệ sinh hàng ngày",
    created_at: "2024-01-25T09:00:00Z",
  },
]

export const seedBills: Bill[] = [
  {
    id: 1,
    bill_id: "INV-2024-001",
    patient_id: 1,
    appointment_id: 1,
    patient_name: "Nguyễn Văn An",
    total_amount: 850000,
    payment_status: "Pending",
    payment_method: undefined,
    payment_date: undefined,
    insurance_provider: "Bảo hiểm xã hội",
    items: [
      { id: 1, description: "Khám tim mạch", quantity: 1, unit_price: 300000, total: 300000 },
      { id: 2, description: "Siêu âm tim", quantity: 1, unit_price: 400000, total: 400000 },
      { id: 3, description: "Xét nghiệm máu", quantity: 1, unit_price: 150000, total: 150000 },
    ],
    created_at: "2024-01-25T09:30:00Z",
  },
  {
    id: 2,
    bill_id: "INV-2024-002",
    patient_id: 2,
    appointment_id: 2,
    patient_name: "Trần Thị Bình",
    total_amount: 450000,
    payment_status: "Paid",
    payment_method: "Tiền mặt",
    payment_date: "2024-01-25",
    insurance_provider: "Bảo hiểm y tế",
    items: [
      { id: 1, description: "Khám nhi khoa", quantity: 1, unit_price: 200000, total: 200000 },
      { id: 2, description: "Thuốc kháng sinh", quantity: 1, unit_price: 250000, total: 250000 },
    ],
    created_at: "2024-01-25T10:45:00Z",
  },
  {
    id: 3,
    bill_id: "INV-2024-003",
    patient_id: 1,
    patient_name: "Nguyễn Văn An",
    total_amount: 1200000,
    payment_status: "Overdue",
    payment_method: undefined,
    payment_date: undefined,
    insurance_provider: undefined,
    items: [
      { id: 1, description: "Phẫu thuật nhỏ", quantity: 1, unit_price: 800000, total: 800000 },
      { id: 2, description: "Thuốc giảm đau", quantity: 2, unit_price: 200000, total: 400000 },
    ],
    created_at: "2024-01-20T14:00:00Z",
  },
]

export const seedBloodBank: BloodBank[] = [
  {
    id: 1,
    blood_id: "BB-A+001",
    blood_type: "A+",
    stock_quantity: 15,
    last_updated: "2024-01-24T16:00:00Z",
    expiry_date: "2024-02-24",
    donor_info: "Người hiến tặng ẩn danh",
    created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: 2,
    blood_id: "BB-O-002",
    blood_type: "O-",
    stock_quantity: 8,
    last_updated: "2024-01-23T10:30:00Z",
    expiry_date: "2024-02-23",
    donor_info: "Người hiến tặng ẩn danh",
    created_at: "2024-01-09T14:00:00Z",
  },
  {
    id: 3,
    blood_id: "BB-B+003",
    blood_type: "B+",
    stock_quantity: 22,
    last_updated: "2024-01-25T09:00:00Z",
    expiry_date: "2024-02-25",
    donor_info: "Người hiến tặng ẩn danh",
    created_at: "2024-01-11T11:00:00Z",
  },
  {
    id: 4,
    blood_id: "BB-AB-004",
    blood_type: "AB-",
    stock_quantity: 5,
    last_updated: "2024-01-22T15:45:00Z",
    expiry_date: "2024-02-22",
    donor_info: "Người hiến tặng ẩn danh",
    created_at: "2024-01-08T09:30:00Z",
  },
  {
    id: 5,
    blood_id: "BB-O+005",
    blood_type: "O+",
    stock_quantity: 18,
    last_updated: "2024-01-25T11:15:00Z",
    expiry_date: "2024-02-25",
    donor_info: "Người hiến tặng ẩn danh",
    created_at: "2024-01-12T13:00:00Z",
  },
]

export const seedAmbulances: Ambulance[] = [
  {
    id: 1,
    ambulance_id: "AMB-001",
    ambulance_number: "59A-12345",
    availability: "Available",
    driver_id: 1,
    driver_name: "Tài xế Nguyễn Văn Tài",
    last_service_date: "2024-01-20",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    ambulance_id: "AMB-002",
    ambulance_number: "59A-67890",
    availability: "On Duty",
    driver_id: 2,
    driver_name: "Tài xế Trần Minh Đức",
    last_service_date: "2024-01-18",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    ambulance_id: "AMB-003",
    ambulance_number: "59A-11111",
    availability: "Maintenance",
    driver_id: undefined,
    driver_name: undefined,
    last_service_date: "2024-01-15",
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const seedAmbulanceLogs: AmbulanceLog[] = [
  {
    id: 1,
    log_id: "LOG-2024-001",
    ambulance_id: 1,
    patient_id: 1,
    ambulance_number: "59A-12345",
    patient_name: "Nguyễn Văn An",
    pickup_location: "123 Đường Lê Lợi, Quận 1",
    dropoff_location: "Bệnh viện Chợ Rẫy",
    pickup_time: "2024-01-25T08:30:00Z",
    dropoff_time: "2024-01-25T09:15:00Z",
    status: "Completed",
    notes: "Bệnh nhân có triệu chứng đau ngực",
    created_at: "2024-01-25T08:00:00Z",
  },
  {
    id: 2,
    log_id: "LOG-2024-002",
    ambulance_id: 2,
    patient_id: 2,
    ambulance_number: "59A-67890",
    patient_name: "Trần Thị Bình",
    pickup_location: "456 Đường Nguyễn Huệ, Quận 3",
    dropoff_location: "Bệnh viện Nhi Đồng 1",
    pickup_time: "2024-01-25T14:00:00Z",
    dropoff_time: undefined,
    status: "In Progress",
    notes: "Trẻ em sốt cao",
    created_at: "2024-01-25T13:30:00Z",
  },
  {
    id: 3,
    log_id: "LOG-2024-003",
    ambulance_id: 1,
    ambulance_number: "59A-12345",
    pickup_location: "789 Đường Cách Mạng Tháng 8, Quận 10",
    dropoff_location: "Bệnh viện Thống Nhất",
    pickup_time: "2024-01-25T16:00:00Z",
    dropoff_time: undefined,
    status: "Scheduled",
    notes: "Tai nạn giao thông nhẹ",
    created_at: "2024-01-25T15:45:00Z",
  },
]
