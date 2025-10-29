# Hospital Management System - Frontend

Frontend web application với Next.js

## Cài đặt nhanh

```bash
# Install dependencies
npm install
# hoặc
pnpm install

# Chạy development
npm run dev

# Build production
npm run build
npm run start
```

## Docker

```bash
docker-compose -f docker-compose.dev.yml up -d
```

## Truy cập

- Development: http://localhost:3000
- Production: http://localhost:3000

## Demo Accounts (from 003_seed_data.sql)

All demo accounts use password: `Demo1234`

- admin@demo.com - Admin
- doctor@demo.com - Doctor  
- nurse@demo.com - Nurse
- patient@demo.com - Patient
- pharmacist@demo.com - Pharmacist
- technician@demo.com - Technician
- lab@demo.com - Lab Assistant
- driver@demo.com - Driver
- worker@demo.com - Worker

## Cấu trúc

- `app/` - Next.js app router
- `components/` - React components
- `lib/` - Utilities và helpers
- `public/` - Static files
