-- Create services table for hospital services catalog
CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    service_name VARCHAR(200) NOT NULL,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Examination, Laboratory, Imaging, Surgery, Treatment, etc.
    unit_price DECIMAL(12,2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'unit', -- unit, session, day, etc.
    is_active BOOLEAN DEFAULT true,
    requires_doctor BOOLEAN DEFAULT false,
    estimated_duration INTEGER, -- in minutes
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create billing_items table for detailed billing breakdown
CREATE TABLE IF NOT EXISTS billing_items (
    item_id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL,
    service_id INTEGER,
    item_description VARCHAR(300) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES billing(bill_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE SET NULL
);

-- Add medical_record_id and appointment_id to billing table
ALTER TABLE billing ADD COLUMN IF NOT EXISTS medical_record_id INTEGER;
ALTER TABLE billing ADD COLUMN IF NOT EXISTS appointment_id INTEGER;

-- Add foreign keys
ALTER TABLE billing ADD CONSTRAINT fk_billing_medical_record 
    FOREIGN KEY (medical_record_id) REFERENCES medical_records(record_id) ON DELETE SET NULL;
    
ALTER TABLE billing ADD CONSTRAINT fk_billing_appointment 
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_service_code ON services(service_code);
CREATE INDEX IF NOT EXISTS idx_billing_items_bill_id ON billing_items(bill_id);
CREATE INDEX IF NOT EXISTS idx_billing_items_service_id ON billing_items(service_id);
CREATE INDEX IF NOT EXISTS idx_billing_medical_record_id ON billing(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_billing_appointment_id ON billing(appointment_id);

-- Insert common hospital services
INSERT INTO services (service_name, service_code, category, unit_price, description, requires_doctor) VALUES
-- Examination Services
('Khám bệnh tổng quát', 'EXAM_GENERAL', 'Examination', 200000, 'Khám bệnh ban đầu, đánh giá tình trạng sức khỏe tổng quát', true),
('Khám chuyên khoa Tim mạch', 'EXAM_CARDIO', 'Examination', 300000, 'Khám và tư vấn về các bệnh lý tim mạch', true),
('Khám chuyên khoa Tiêu hóa', 'EXAM_GASTRO', 'Examination', 300000, 'Khám và điều trị các bệnh về tiêu hóa', true),
('Khám chuyên khoa Thần kinh', 'EXAM_NEURO', 'Examination', 350000, 'Khám và điều trị các bệnh về thần kinh', true),
('Khám chuyên khoa Nhi', 'EXAM_PEDIA', 'Examination', 250000, 'Khám sức khỏe cho trẻ em', true),
('Tái khám', 'EXAM_FOLLOWUP', 'Examination', 150000, 'Tái khám sau điều trị', true),

-- Laboratory Services
('Xét nghiệm máu tổng quát', 'LAB_CBC', 'Laboratory', 150000, 'Đo các thông số cơ bản của máu', false),
('Xét nghiệm sinh hóa máu', 'LAB_BIOCHEM', 'Laboratory', 250000, 'Đánh giá chức năng gan, thận, lipid máu', false),
('Xét nghiệm nước tiểu', 'LAB_URINE', 'Laboratory', 80000, 'Phân tích các thành phần trong nước tiểu', false),
('Xét nghiệm đường huyết', 'LAB_GLUCOSE', 'Laboratory', 50000, 'Đo nồng độ đường trong máu', false),
('Xét nghiệm chức năng gan', 'LAB_LIVER', 'Laboratory', 200000, 'Kiểm tra các enzym và chức năng gan', false),
('Xét nghiệm chức năng thận', 'LAB_KIDNEY', 'Laboratory', 180000, 'Đánh giá khả năng lọc của thận', false),
('Xét nghiệm HbA1c', 'LAB_HBA1C', 'Laboratory', 150000, 'Đo đường huyết trung bình 3 tháng', false),

-- Imaging Services
('Chụp X-Quang ngực', 'IMG_XRAY_CHEST', 'Imaging', 200000, 'Chụp X-quang lồng ngực', false),
('Chụp X-Quang xương', 'IMG_XRAY_BONE', 'Imaging', 180000, 'Chụp X-quang xương, khớp', false),
('Siêu âm bụng tổng quát', 'IMG_US_ABD', 'Imaging', 300000, 'Siêu âm gan, mật, lách, thận', false),
('Siêu âm tim', 'IMG_ECHO', 'Imaging', 500000, 'Siêu âm đánh giá chức năng tim', false),
('Chụp CT Scanner', 'IMG_CT', 'Imaging', 1500000, 'Chụp cắt lớp vi tính', false),
('Chụp MRI', 'IMG_MRI', 'Imaging', 3000000, 'Chụp cộng hưởng từ', false),
('Nội soi dạ dày', 'IMG_ENDOSCOPY', 'Imaging', 800000, 'Nội soi đường tiêu hóa trên', true),

-- Treatment Services
('Truyền dịch', 'TREAT_IV', 'Treatment', 100000, 'Truyền dịch tĩnh mạch', false),
('Tiêm thuốc', 'TREAT_INJ', 'Treatment', 30000, 'Tiêm thuốc theo chỉ định', false),
('Thay băng', 'TREAT_DRESSING', 'Treatment', 50000, 'Thay băng vết thương', false),
('Vật lý trị liệu', 'TREAT_PHYSIO', 'Treatment', 200000, 'Buổi vật lý trị liệu', false),
('Châm cứu', 'TREAT_ACUPUNC', 'Treatment', 250000, 'Buổi châm cứu', false),

-- Surgery Services
('Phẫu thuật nhỏ', 'SURG_MINOR', 'Surgery', 2000000, 'Phẫu thuật ngoại trú đơn giản', true),
('Phẫu thuật trung bình', 'SURG_MODERATE', 'Surgery', 5000000, 'Phẫu thuật có độ phức tạp trung bình', true),
('Phẫu thuật lớn', 'SURG_MAJOR', 'Surgery', 15000000, 'Phẫu thuật lớn, phức tạp', true),

-- Room Services
('Phòng bệnh thường - 1 ngày', 'ROOM_STANDARD', 'Hospitalization', 500000, 'Chi phí nằm viện phòng thường mỗi ngày', false),
('Phòng VIP - 1 ngày', 'ROOM_VIP', 'Hospitalization', 1500000, 'Chi phí nằm viện phòng VIP mỗi ngày', false),
('Phòng ICU - 1 ngày', 'ROOM_ICU', 'Hospitalization', 3000000, 'Chi phí chăm sóc tích cực mỗi ngày', false),

-- Emergency Services
('Cấp cứu', 'EMERG_ER', 'Emergency', 500000, 'Dịch vụ cấp cứu', true),
('Xe cứu thương', 'EMERG_AMB', 'Emergency', 1000000, 'Dịch vụ xe cấp cứu', false);

COMMENT ON TABLE services IS 'Catalog of hospital services with pricing';
COMMENT ON TABLE billing_items IS 'Detailed breakdown of services/items in each bill';
COMMENT ON COLUMN billing.medical_record_id IS 'Link to medical record that generated this bill';
COMMENT ON COLUMN billing.appointment_id IS 'Link to appointment that generated this bill';
