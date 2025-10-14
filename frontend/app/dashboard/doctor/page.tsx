"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { formatAppointmentTime } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Calendar,
  Clock,
  FileText,
  Plus,
  Play,
  CheckCircle,
  Stethoscope,
  Pill,
  AlertTriangle,
  Bell,
  Search,
  Heart,
  Activity,
  Thermometer,
  TestTube,
  Printer,
  Eye,
  Save,
  Bed,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  UserCheck,
  FlaskConical,
  // Inbox, // Hidden: Feature not yet implemented
  Settings,
  Users,
  UserCog,
  X,
  CreditCard,
  Building2,
  Droplets,
  DoorOpen,
  BedDouble,
  Building,
  LogOut,
  User,
  RefreshCcw
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@/hooks/useUser"
import { doctorApi, DoctorDashboardData, AppointmentData, DoctorInfo, staffApi, StaffMember } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ShiftScheduleCalendar from "@/components/shared/ShiftScheduleCalendar"

// Doctor Dashboard Components
import DoctorSidebar from "@/components/doctor/DoctorSidebar"
import DoctorTopBar from "@/components/doctor/DoctorTopBar"
import DoctorKPICards from "@/components/doctor/DoctorKPICards"
// Tab Components
import TimelineTab from "@/components/doctor/tabs/TimelineTab"
import ResultsTab from "@/components/doctor/tabs/ResultsTab"
import PatientsTab from "@/components/doctor/tabs/PatientsTab"
import DoctorsTab from "@/components/doctor/tabs/DoctorsTab"
import StaffTab from "@/components/doctor/tabs/StaffTab"
import AppointmentsTab from "@/components/doctor/tabs/AppointmentsTab"
// import InboxTab from "@/components/doctor/tabs/InboxTab" // Hidden: Feature not yet implemented
import InpatientTab from "@/components/doctor/tabs/InpatientTab"
import MedicalRecordsTab from "@/components/doctor/tabs/MedicalRecordsTab"
import ChartTab from "@/components/doctor/tabs/ChartTab"
// Dialog Components
import PatientDetailDialog from "@/components/doctor/dialogs/PatientDetailDialog"
import MedicalHistoryDialog from "@/components/doctor/dialogs/MedicalHistoryDialog"
import ProgressNotesDialog from "@/components/doctor/dialogs/ProgressNotesDialog"
import MedicalRecordDetailDialog from "@/components/doctor/dialogs/MedicalRecordDetailDialog"
import PrintMedicalRecord from "@/components/doctor/PrintMedicalRecord"

export default function DoctorDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("timeline")
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [showPatientChart, setShowPatientChart] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(false)
  
  // Real KPI Data States
  const [dashboardData, setDashboardData] = useState<DoctorDashboardData | null>(null)
  const [allAppointments, setAllAppointments] = useState<AppointmentData[]>([])
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [inpatients, setInpatients] = useState([])
  const [pendingResults, setPendingResults] = useState([])
  const [messages, setMessages] = useState([])
  const [criticalAlerts, setCriticalAlerts] = useState(0)
  
  // Appointment Filter States
  const [daysFilter, setDaysFilter] = useState<number>(7)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)
  const [allDoctors, setAllDoctors] = useState<DoctorInfo[]>([])
  const [doctorStats, setDoctorStats] = useState<any>(null)
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [staffStats, setStaffStats] = useState<any>(null)
  const [greeting, setGreeting] = useState<string>('')
  
  // Client-side date states
  const [currentDate, setCurrentDate] = useState<string>('')
  const [currentDateFormatted, setCurrentDateFormatted] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  // Dialog States
  const [showPatientDetail, setShowPatientDetail] = useState(false)
  const [showMedicalHistory, setShowMedicalHistory] = useState(false)
  const [showProgressNotes, setShowProgressNotes] = useState(false)
  const [showExamination, setShowExamination] = useState(false)
  const [showMedicalRecordDetail, setShowMedicalRecordDetail] = useState(false)
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState<any | null>(null)
  const [showLabResultDialog, setShowLabResultDialog] = useState(false)
  const [selectedLabResult, setSelectedLabResult] = useState<any | null>(null)
  const [showPrintDialog, setShowPrintDialog] = useState(false)
  
  // Clinical Workflow States
  const [clinicalTab, setClinicalTab] = useState("notes")
  const [clinicalNotes, setClinicalNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    template: "",
  })
  const [orders, setOrders] = useState([])
  const [newOrder, setNewOrder] = useState({
    type: "",
    test: "",
    priority: "routine",
    notes: "",
  })
  const [prescription, setPrescription] = useState({
    medicine_id: "",
    medicine_name: "",
    quantity: "1",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  })
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [loadingMedicines, setLoadingMedicines] = useState(false)
  const [medicineSearchOpen, setMedicineSearchOpen] = useState(false)
  const [medicineSearchValue, setMedicineSearchValue] = useState("")
  const [medicalHistory, setMedicalHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // KPI Data with defaults
  // Calculate real KPI data from states
  const kpiData = {
    appointmentsToday: dashboardData?.todayAppointments || appointments.filter((apt: AppointmentData) => {
      const today = new Date().toISOString().split('T')[0];
      const appointmentDate = apt.appointment_date.split('T')[0];
      // Chỉ hiển thị lịch hẹn đã xác nhận của hôm nay
      return appointmentDate === today && (apt.status === "Confirmed" || apt.status === "Đã xác nhận");
    }).length,
    completedToday: appointments.filter((apt: AppointmentData) => apt.status === "Completed" || apt.status === "Hoàn thành").length,
    pendingResults: pendingResults.length,
    criticalAlerts: criticalAlerts,
    inpatients: inpatients.length,
    newMessages: messages.filter((msg: any) => !msg.read).length
  }

  // Helper Functions
  const isValueInRange = (value: any, range: string) => {
    if (!value || !range) return true;
    const numValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) return true;
    const rangeStr = range.trim();
    if (rangeStr.startsWith('<') || rangeStr.startsWith('≤')) {
      const maxValue = parseFloat(rangeStr.replace(/[^0-9.-]/g, ''));
      return numValue <= maxValue;
    }
    if (rangeStr.startsWith('>') || rangeStr.startsWith('≥')) {
      const minValue = parseFloat(rangeStr.replace(/[^0-9.-]/g, ''));
      return numValue >= minValue;
    }
    const rangeParts = rangeStr.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (rangeParts && rangeParts.length >= 3) {
      const minValue = parseFloat(rangeParts[1]);
      const maxValue = parseFloat(rangeParts[2]);
      return numValue >= minValue && numValue <= maxValue;
    }
    return true;
  }

  const handlePrintLabResult = (result: any) => {
    toast({
      title: "In kết quả",
      description: `Đang chuẩn bị in kết quả xét nghiệm cho ${result.patient?.full_name}...`,
    });
  }

  const filterAppointments = (appointments: AppointmentData[]) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return appointments.filter((apt: AppointmentData) => {
      const aptDate = new Date(apt.appointment_date);
      aptDate.setHours(0, 0, 0, 0);
      if (daysFilter > 0) {
        const maxDate = new Date(now);
        maxDate.setDate(maxDate.getDate() + daysFilter);
        if (aptDate < now || aptDate > maxDate) return false;
      } else if (daysFilter < 0) {
        const minDate = new Date(now);
        minDate.setDate(minDate.getDate() + daysFilter);
        if (aptDate < minDate || aptDate > now) return false;
      }
      if (statusFilter === 'all') return true;
      if (statusFilter === 'scheduled') return apt.status === 'Scheduled';
      if (statusFilter === 'confirmed') return apt.status === 'Confirmed';
      if (statusFilter === 'cancelled') return apt.status === 'Cancelled';
      if (statusFilter === 'completed') return apt.status === 'Completed';
      return true;
    });
  };

  // Apply filters when filter options change
  useEffect(() => {
    setAppointments(filterAppointments(allAppointments));
  }, [daysFilter, statusFilter, allAppointments]);

  // Initialize greeting and date
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('sáng');
    else if (hour < 18) setGreeting('chiều');
    else setGreeting('tối');

    const today = new Date();
    setCurrentDate(today.toISOString().split('T')[0]);
    setCurrentDateFormatted(today.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // Load all data independently to prevent one failure from blocking others
      await Promise.allSettled([
        // Load doctor dashboard data
        doctorApi.getDashboard()
          .then(response => {
            setDashboardData(response);
          })
          .catch(() => {}),

        // Load doctor appointments
        doctorApi.getAppointments({ limit: 100 })
          .then(response => {
            setAllAppointments(response.data);
            setAppointments(response.data); // Initial display
          })
          .catch(() => {}),

        // Load doctor patients (inpatients)
        doctorApi.getPatients({ limit: 10 })
          .then(response => {
            setInpatients(response.data);
          })
          .catch(() => {}),

        // Load medical records (pending results)
        doctorApi.getMedicalRecords({ limit: 10 })
          .then(response => {
            setPendingResults(response.data);
          })
          .catch(() => {}),

        // Load medicines for prescription
        doctorApi.getMedicines()
          .then(response => {
            setMedicines(response);
          })
          .catch((error) => {
            console.error('Failed to load medicines:', error);
          }),

        // Get all doctors to find current doctor info
        doctorApi.getAllDoctors({ limit: 100 })
          .then(response => {
            setAllDoctors(response.data);
            
            if (response.data && user?.user_id) {
              const currentDoctor = response.data.find((doctor: DoctorInfo) => doctor.user_id === user.user_id);
              if (currentDoctor) {
                setDoctorInfo(currentDoctor);
              }
            }
          })
          .catch(() => {}),

        // Load doctor statistics
        doctorApi.getStatistics()
          .then(response => {
            setDoctorStats(response);
          })
          .catch(() => {}),

        // Load staff list
        staffApi.getAllStaff({ limit: 100 })
          .then(response => {
            setStaffList(response.data);
            // Calculate staff stats
            const byRole: Record<string, number> = {};
            response.data.forEach((staff: StaffMember) => {
              const position = staff.position || 'Khác';
              byRole[position] = (byRole[position] || 0) + 1;
            });
            setStaffStats({ total: response.data.length, byRole });
          })
          .catch((error) => {
            console.error('Failed to load staff:', error);
          }),
      ]);

      // Set critical alerts based on real data
      setCriticalAlerts(0);

    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Auto-load medical history when patient is selected for examination
  useEffect(() => {
    const loadPatientMedicalHistory = async () => {
      const patientId = selectedPatient?.patient_id || selectedPatient?.patient_info?.patient_id;
      
      if (patientId && activeTab === "chart") {
        setLoadingHistory(true);
        try {
          const response = await doctorApi.getMedicalRecords({ 
            patient_id: patientId,
            limit: 50 // Get last 50 records
          });
          setMedicalHistory(response.data || []);
        } catch (error) {
          console.error('Failed to load medical history:', error);
          setMedicalHistory([]);
        } finally {
          setLoadingHistory(false);
        }
      } else {
        // Clear medical history when no patient is selected or not in chart tab
        setMedicalHistory([]);
        setLoadingHistory(false);
      }
    };

    loadPatientMedicalHistory();
  }, [selectedPatient?.patient_id, selectedPatient?.patient_info?.patient_id, activeTab]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth');
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng xuất",
        variant: "destructive",
      });
    }
  };

  // Patient handlers
  const handleViewPatientDetail = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientDetail(true);
  };

  const handleViewMedicalHistory = async (patient: any) => {
    setSelectedPatient(patient);
    setShowMedicalHistory(true);
    setLoadingHistory(true);
    try {
      const response = await doctorApi.getMedicalRecords({ 
        patient_id: patient.patient_id,
        limit: 50
      });
      setMedicalHistory(response.data || []);
    } catch (error) {
      console.error("Error loading medical history:", error);
      setMedicalHistory([]);
      toast({
        title: "Lỗi",
        description: "Không thể tải lịch sử khám bệnh",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewProgressNotes = (patient: any) => {
    setSelectedPatient(patient);
    setShowProgressNotes(true);
  };

  const handleStartExamination = (patient: any) => {
    // Get current date and time for examination
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    
    // Prepare patient data in the format ChartTab expects
    const patientData = {
      patient_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
      patient_id: patient.patient_id,
      patient_info: patient,
      appointment_date: currentDate,
      appointment_time: currentTime,
      purpose: 'Khám tổng quát',
    };
    
    setSelectedPatient(patientData);
    setActiveTab("chart");
  };

  const handleViewMedicalRecordDetail = (record: any) => {
    setSelectedMedicalRecord(record);
    setShowMedicalRecordDetail(true);
  };

  const startVisit = (appointment: any) => {
    // Prepare patient data in the format ChartTab expects
    const patientData = {
      patient_name: `${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`.trim(),
      patient_id: appointment.patient?.patient_id,
      patient_info: appointment.patient,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      purpose: appointment.purpose,
    };
    
    setSelectedPatient(patientData);
    setActiveTab("chart");
    toast({
      title: "Bắt đầu khám",
      description: `Đã mở hồ sơ cho ${appointment.patient?.first_name} ${appointment.patient?.last_name}`,
    });
  };

  // Clinical workflow handlers
  const handleAddOrder = () => {
    if (!newOrder.type || !newOrder.test) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin chỉ định",
        variant: "destructive",
      });
      return;
    }

    setOrders([...orders, { ...newOrder, id: Date.now() }]);
    setNewOrder({
      type: "",
      test: "",
      priority: "routine",
      notes: "",
    });

    toast({
      title: "Thành công",
      description: "Đã thêm chỉ định",
    });
  };

  const handleRemoveOrder = (id: number) => {
    setOrders(orders.filter((o: any) => o.id !== id));
    toast({
      title: "Đã xóa",
      description: "Đã xóa chỉ định",
    });
  };

  const handleAddPrescription = async () => {
    if (!prescription.medicine_id || !prescription.dosage || !prescription.frequency) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin thuốc (Tên thuốc, Liều lượng, Tần suất)",
        variant: "destructive",
      });
      return;
    }

    if (!prescription.quantity || parseInt(prescription.quantity) < 1) {
      toast({
        title: "Lỗi",
        description: "Số lượng phải lớn hơn 0",
        variant: "destructive",
      });
      return;
    }

    setPrescriptions([...prescriptions, { ...prescription, id: Date.now() }]);
    
    toast({
      title: "Thành công",
      description: `Đã thêm thuốc ${prescription.medicine_name}`,
    });

    setPrescription({
      medicine_id: "",
      medicine_name: "",
      quantity: "1",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  };

  const handleRemovePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter((p: any) => p.id !== id));
    toast({
      title: "Đã xóa",
      description: "Đã xóa thuốc khỏi đơn",
    });
  };

  const handleSaveCompleteRecord = async () => {
    if (!selectedPatient || !clinicalNotes.assessment || !clinicalNotes.plan) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ Chẩn đoán và Kế hoạch điều trị",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const patientId = selectedPatient.patient_id || selectedPatient.patient_info?.patient_id;
      
      if (!patientId) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy ID bệnh nhân",
          variant: "destructive",
        });
        return;
      }

      // Build diagnosis section with SOAP format
      const diagnosisText = `
[TRIỆU CHỨNG CHỦ QUAN]
${clinicalNotes.subjective || 'Không có'}

[KHÁM LÂM SÀNG]
${clinicalNotes.objective || 'Không có'}

[CHẨN ĐOÁN]
${clinicalNotes.assessment}
`.trim();

      // Build treatment section
      const treatmentText = `
[KẾ HOẠCH ĐIỀU TRỊ]
${clinicalNotes.plan}

[CHỈ ĐỊNH CẬN LÂM SÀNG]
${orders.length > 0 ? orders.map((order, index) => 
  `${index + 1}. ${order.test} (${order.type === 'lab' ? 'Xét nghiệm' : order.type === 'imaging' ? 'Chẩn đoán hình ảnh' : order.type === 'procedure' ? 'Thủ thuật' : 'Hội chẩn'}) - ${order.priority === 'routine' ? 'Thường quy' : order.priority === 'urgent' ? 'Khẩn cấp' : 'Cấp cứu'}`
).join('\n') : 'Không có chỉ định'}
`.trim();

      // Build prescription text if any
      const prescriptionText = prescriptions.length > 0 
        ? prescriptions.map((rx, index) => 
            `${index + 1}. ${rx.medicine_name} - ${rx.dosage} x ${rx.quantity} - ${rx.frequency} - ${rx.duration}${rx.instructions ? ' (' + rx.instructions + ')' : ''}`
          ).join('\n')
        : undefined;

      // Save medical record
      await doctorApi.createMedicalRecord({
        patient_id: patientId,
        diagnosis: diagnosisText,
        treatment: treatmentText,
        prescription: prescriptionText,
      });

      const patientName = selectedPatient.patient_name || 
                         `${selectedPatient.patient_info?.first_name || ''} ${selectedPatient.patient_info?.last_name || ''}`.trim();
      
      toast({
        title: "Lưu hồ sơ thành công",
        description: `Đã lưu hồ sơ khám bệnh cho ${patientName}`,
      });

      // Reset form
      setClinicalNotes({ subjective: '', objective: '', assessment: '', plan: '' });
      setOrders([]);
      setPrescriptions([]);
      setSelectedPatient(null);
      setActiveTab("timeline");
      
      // Reload dashboard data to show new record
      loadDashboardData();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu hồ sơ khám bệnh",
        variant: "destructive",
      });
    }
  };

  // Badge helpers
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      "Scheduled": "bg-yellow-100 text-yellow-800",
      "Confirmed": "bg-blue-100 text-blue-800",
      "Completed": "bg-green-100 text-green-800",
      "Cancelled": "bg-red-100 text-red-800",
      "Đã xác nhận": "bg-blue-100 text-blue-800",
      "Chưa xác nhận": "bg-yellow-100 text-yellow-800",
      "Đã hoàn thành": "bg-green-100 text-green-800",
      "Đã hủy": "bg-red-100 text-red-800",
    };
    return <Badge className={statusColors[status] || "bg-gray-100 text-gray-800"}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      "Cao": "bg-red-100 text-red-800",
      "Trung bình": "bg-yellow-100 text-yellow-800",
      "Bình thường": "bg-green-100 text-green-800",
    };
    return <Badge className={colors[priority] || colors["Bình thường"]}>{priority}</Badge>;
  };

  // Loading state
  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <DoctorSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        kpiData={{
          inpatients: kpiData.inpatients,
          pendingResults: kpiData.pendingResults,
          newMessages: kpiData.newMessages,
        }}
        doctorInfo={doctorInfo}
        userEmail={user?.email || null}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar Component */}
        <DoctorTopBar
          activeTab={activeTab}
          greeting={greeting}
          doctorInfo={doctorInfo}
          userFullName={user?.full_name}
          userEmail={user?.email}
          currentDateFormatted={currentDateFormatted}
          mounted={mounted}
          newMessagesCount={kpiData.newMessages}
        />

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* KPI Cards - Only on timeline tab */}
          {activeTab === "timeline" && <DoctorKPICards kpiData={kpiData} />}

          {/* Tab Content */}
          <div className="mt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-0">
                <TimelineTab
                  appointments={appointments}
                  allAppointments={allAppointments}
                  messages={messages}
                  daysFilter={daysFilter}
                  statusFilter={statusFilter}
                  onDaysFilterChange={setDaysFilter}
                  onStatusFilterChange={setStatusFilter}
                  onStartVisit={startVisit}
                />
              </TabsContent>

              {/* Chart Tab - Patient Examination (Keep original complex logic) */}
              <TabsContent value="chart">
                <ChartTab
                  selectedPatient={selectedPatient}
                  clinicalTab={clinicalTab}
                  onClinicalTabChange={setClinicalTab}
                  clinicalNotes={clinicalNotes}
                  onClinicalNotesChange={setClinicalNotes}
                  newOrder={newOrder}
                  onNewOrderChange={setNewOrder}
                  orders={orders}
                  onAddOrder={handleAddOrder}
                  onRemoveOrder={handleRemoveOrder}
                  prescription={prescription}
                  onPrescriptionChange={setPrescription}
                  prescriptions={prescriptions}
                  onAddPrescription={handleAddPrescription}
                  onRemovePrescription={handleRemovePrescription}
                  medicines={medicines}
                  medicineSearchOpen={medicineSearchOpen}
                  onMedicineSearchOpenChange={setMedicineSearchOpen}
                  medicineSearchValue={medicineSearchValue}
                  onMedicineSearchValueChange={setMedicineSearchValue}
                  medicalHistory={medicalHistory}
                  loadingHistory={loadingHistory}
                  onSaveCompleteRecord={handleSaveCompleteRecord}
                  onPrintMedicalRecord={() => setShowPrintDialog(true)}
                />
              </TabsContent>

              {/* Inpatient Tab */}
              <TabsContent value="inpatient">
                <InpatientTab
                  inpatients={inpatients}
                  handleViewProgressNotes={handleViewProgressNotes}
                  handleViewMedicalHistory={handleViewMedicalHistory}
                  handleStartExamination={handleStartExamination}
                />
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="results">
                <ResultsTab
                  pendingResults={pendingResults}
                  loadDashboardData={loadDashboardData}
                  handlePrintLabResult={handlePrintLabResult}
                  setSelectedLabResult={setSelectedLabResult}
                  setShowLabResultDialog={setShowLabResultDialog}
                  isValueInRange={isValueInRange}
                />
              </TabsContent>

              {/* Patients Tab */}
              <TabsContent value="patients">
                <PatientsTab
                  inpatients={inpatients}
                  handleViewPatientDetail={handleViewPatientDetail}
                />
              </TabsContent>

              {/* Doctors Tab */}
              <TabsContent value="doctors">
                <DoctorsTab allDoctors={allDoctors} />
              </TabsContent>

              {/* Staff Tab */}
              <TabsContent value="staff">
                <StaffTab staffList={staffList} staffStats={staffStats} />
              </TabsContent>

              {/* Shifts Tab */}
              <TabsContent value="shifts">
                <ShiftScheduleCalendar role="doctor" onRefresh={loadDashboardData} />
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <AppointmentsTab
                  appointments={appointments}
                  mounted={mounted}
                  currentDate={currentDate}
                  currentDateFormatted={currentDateFormatted}
                  formatAppointmentTime={formatAppointmentTime}
                  getStatusBadge={getStatusBadge}
                />
              </TabsContent>

              {/* Medical Records Tab */}
              <TabsContent value="medical-records">
                <MedicalRecordsTab
                  pendingResults={pendingResults}
                  handleViewMedicalRecordDetail={handleViewMedicalRecordDetail}
                />
              </TabsContent>

              {/* Inbox Tab - Hidden: Feature not yet implemented */}
              {/* <TabsContent value="inbox">
                <InboxTab messages={messages} getPriorityBadge={getPriorityBadge} />
              </TabsContent> */}
            </Tabs>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <PatientDetailDialog
        open={showPatientDetail}
        onOpenChange={setShowPatientDetail}
        patient={selectedPatient}
        onViewMedicalHistory={handleViewMedicalHistory}
        onViewProgressNotes={handleViewProgressNotes}
        onStartExamination={handleStartExamination}
      />

      <MedicalHistoryDialog
        open={showMedicalHistory}
        onOpenChange={setShowMedicalHistory}
        patient={selectedPatient}
        onViewProgressNotes={handleViewProgressNotes}
        onStartExamination={handleStartExamination}
      />

      <ProgressNotesDialog
        open={showProgressNotes}
        onOpenChange={setShowProgressNotes}
        patient={selectedPatient}
        onViewMedicalHistory={handleViewMedicalHistory}
        onStartExamination={handleStartExamination}
      />

      <MedicalRecordDetailDialog
        open={showMedicalRecordDetail}
        onOpenChange={setShowMedicalRecordDetail}
        record={selectedMedicalRecord}
      />

      <PrintMedicalRecord
        open={showPrintDialog}
        onOpenChange={setShowPrintDialog}
        patientData={selectedPatient || {}}
        clinicalNotes={clinicalNotes}
        orders={orders}
        prescriptions={prescriptions}
        doctorInfo={{
          name: doctorInfo?.full_name || user?.name || '',
          title: doctorInfo?.title || 'Bác sĩ',
          department: doctorInfo?.department || '',
        }}
      />
    </div>
  );
}
