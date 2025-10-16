# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)

## Quick Start

### 1. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE eduassess;
exit

# Import schema
mysql -u root -p eduassess < backend/database.sql
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Demo Login
- **Admin**: admin@eduassess.com / admin123
- **Student**: student@eduassess.com / student123

## Environment Variables
Create `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=eduassess
JWT_SECRET=your-secret-key
PORT=5000
```
