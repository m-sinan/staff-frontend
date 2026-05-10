# Staff Management System - Frontend

A React.js web application for managing staff members and attendance records for P-R Events.

## 🚀 Live App
https://mezaevent.vercel.app

## 🛠️ Tech Stack
- React.js (Vite)
- React Router DOM
- Axios
- Recharts
- Context API (Auth)
- CSS (custom styling)

## 📁 Project Structure
staff-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Toast.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Staffs.jsx
│   │   ├── Attendance.jsx
│   │   └── AttendanceSubmit.jsx
│   ├── styles/
│   │   ├── Login.css
│   │   ├── Dashboard.css
│   │   ├── Staffs.css
│   │   ├── Attendance.css
│   │   ├── AttendanceSubmit.css
│   │   ├── Navbar.css
│   │   └── Toast.css
│   └── utils/
│       └── axios.js
└── vercel.json
## 🔧 Installation

1. Clone the repository
```bash
git clone https://github.com/m-sinan/staff-frontend.git
cd staff-frontend
```

2. Install dependencies
```bash
npm install
```

3. Update API URL in `src/utils/axios.js`
```js
const instance = axios.create({
    baseURL: 'http://localhost:5000/api'
})
```

4. Run the app
```bash
npm run dev
```

## 📌 Pages

| Page | Path | Access | Description |
|------|------|--------|-------------|
| Login | / | Public | Owner login |
| Dashboard | /dashboard | Protected | Stats and charts |
| Staffs | /staffs | Protected | Manage staff members |
| Attendance | /attendance | Protected | View and filter records |
| Submit | /submit | Public | Staff attendance submission |

## ✨ Features
- ✅ JWT Authentication
- ✅ Protected owner routes
- ✅ Staff CRUD with photo upload
- ✅ Auto GPS location for attendance
- ✅ Monthly attendance chart
- ✅ Live search and filtering
- ✅ Toast notifications
- ✅ Responsive design

## 👨‍💻 Developer
- **Muhamed Sinan K**
- GitHub: [@m-sinan](https://github.com/m-sinan)
