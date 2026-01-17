# Admin Dashboard (React + Tailwind)

This frontend is designed to work with your Node.js/Express backend.

## 1) Install
```bash
npm install
```

## 2) Configure API base URL
Create a `.env` file (or copy `.env.example`) and set:
```bash
VITE_API_BASE_URL=http://localhost:3000
```

## 3) Run
```bash
npm run dev
```

## Backend routes used
- POST `/auth/login`
- GET `/auth/me`
- GET/POST/DELETE `/users` (admin only)
- GET/POST/PUT/DELETE `/courses`
- GET `/enrollments` (teacher only for list)
- GET `/health`
