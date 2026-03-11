# Jona Crest Properties - Complete Application Startup Guide

## Overview

Jona Crest Properties is a full-stack real estate platform consisting of three main services:

| Service | Port | Description |
|---------|------|-------------|
| **Backend** | `4000` | Express.js REST API with MongoDB |
| **Frontend** | `5173` | Main user-facing React (Vite) application |
| **Admin** | `5174` | Admin dashboard React (Vite) application |

---

## Prerequisites

Before running the application, ensure you have:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** running locally on `mongodb://localhost:27017`

---

## Quick Start (All Services)

Open **3 separate terminal windows** and run:

### Terminal 1: Backend API
```bash
cd backend
npm install
npm run dev
```
✅ Should show: `Server running on port 4000` and `MongoDB Connected`

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ Should show: `VITE ready` at `http://localhost:5173/`

### Terminal 3: Admin Panel
```bash
cd admin
npm install
npm run dev -- --port 5174
```
✅ Should show: `VITE ready` at `http://localhost:5174/`

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jona_crest

# JWT
JWT_SECRET=your_jwt_secret_here

# Cloudinary (Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ImageKit (Alternative)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI Services (Optional)
GOOGLE_AI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:4000
```

### Admin (`admin/.env`)

```env
VITE_BACKEND_URL=http://localhost:4000
```

---

## Access URLs

Once all services are running:

| Application | URL |
|-------------|-----|
| 🏠 **Main Website** | http://localhost:5173 |
| 🔧 **Admin Dashboard** | http://localhost:5174 |
| 📡 **API Dashboard** | http://localhost:4000 |
| 📡 **API Endpoints** | http://localhost:4000/api/* |

---

## Development Scripts

### Backend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |

### Frontend & Admin
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cloudinary/ImageKit (Image Uploads)
- Nodemailer (Email)
- Google Generative AI (AI Features)

### Frontend & Admin
- React 18
- Vite
- TailwindCSS
- Framer Motion
- React Router
- Axios

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :4000
# Kill it
kill -9 <PID>
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
brew services list | grep mongodb
# Start MongoDB
brew services start mongodb-community
```

### Missing Dependencies
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Production Deployment

For production, set environment variables and run:

```bash
# Backend
cd backend
npm run start:prod

# Frontend
cd frontend
npm run build
npm run preview

# Admin
cd admin
npm run build
npm run preview
```

---

*Generated on 2026-01-23*
