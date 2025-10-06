-- Appointments cho BS. Lê Thị Jang (doctor_id = 15) - Nhi Tiêu hóa - Hôm nay 2025-10-06
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, purpose, status, created_at)
VALUES 
  (1, 15, '2025-10-06', '08:00:00', 'Khám tiêu hóa cho trẻ', 'Confirmed', NOW()),
  (2, 15, '2025-10-06', '09:00:00', 'Đau bụng, tiêu chảy', 'Confirmed', NOW()),
  (3, 15, '2025-10-06', '10:00:00', 'Táo bón ở trẻ', 'Confirmed', NOW()),
  (4, 15, '2025-10-06', '11:00:00', 'Tái khám sau điều trị', 'Confirmed', NOW()),
  (5, 15, '2025-10-06', '13:30:00', 'Biếng ăn ở trẻ', 'Confirmed', NOW()),
  (1, 15, '2025-10-06', '14:30:00', 'Khám định kỳ', 'Confirmed', NOW()),
  (2, 15, '2025-10-06', '15:30:00', 'Tư vấn dinh dưỡng', 'Confirmed', NOW()),
  (3, 15, '2025-10-06', '16:00:00', 'Đau dạ dày', 'Confirmed', NOW());
