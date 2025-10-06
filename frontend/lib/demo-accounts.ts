export interface DemoAccount {
  email: string
  password: string
  role: string
  firstName: string
  lastName: string
  user_id: string
}

export const demoAccounts: DemoAccount[] = [
  {
    email: "admin@demo.com",
    password: "Demo1234",  // Match database password
    role: "Admin",
    firstName: "Demo",
    lastName: "Admin",
    user_id: "demo_admin_001",
  },
  {
    email: "doctor@demo.com",
    password: "Demo1234",  // Match database password
    role: "Doctor",
    firstName: "BS. Demo",
    lastName: "Bác sĩ",
    user_id: "demo_doctor_001",
  },
  {
    email: "nurse@demo.com",
    password: "Demo1234",  // Match database password
    role: "Nurse",
    firstName: "Y tá",
    lastName: "Demo",
    user_id: "demo_nurse_001",
  },
  {
    email: "patient@demo.com",
    password: "Demo1234",  // Match database password
    role: "Patient",
    firstName: "Bệnh nhân",
    lastName: "Demo",
    user_id: "demo_patient_001",
  },
  {
    email: "pharmacist@demo.com",
    password: "Demo1234",  // Match database password
    role: "Pharmacist",
    firstName: "Dược sĩ",
    lastName: "Demo",
    user_id: "demo_pharmacist_001",
  },
  {
    email: "technician@demo.com",
    password: "Demo1234",  // Match database password
    role: "Technician",
    firstName: "Kỹ thuật viên",
    lastName: "Demo",
    user_id: "demo_technician_001",
  },
  {
    email: "lab@demo.com",
    password: "Demo1234",  // Match database password
    role: "Lab Assistant",
    firstName: "Xét nghiệm",
    lastName: "Demo",
    user_id: "demo_lab_001",
  },
  {
    email: "driver@demo.com",
    password: "Demo1234",  // Match database password
    role: "Driver",
    firstName: "Tài xế",
    lastName: "Demo",
    user_id: "demo_driver_001",
  },
  {
    email: "worker@demo.com",
    password: "Demo1234",  // Match database password
    role: "Worker",
    firstName: "Nhân viên",
    lastName: "Demo",
    user_id: "demo_worker_001",
  },
]
