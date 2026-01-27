@echo off
echo Starting Main Backend...
start "Main Backend (Port 5000)" /D "backend" nodemon server.js

echo Starting Main Frontend...
start "Main Frontend (Port 5173)" npm run dev

echo Starting TTL Attendance Backend...
start "TTL Backend (Port 5001)" /D "ttl_attendance_system\server" npm run dev

echo Starting TTL Attendance Frontend...
start "TTL Frontend (Port 5174)" /D "ttl_attendance_system\client" npm run dev

echo All services started in separate windows.
