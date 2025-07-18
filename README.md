# Korus Employee Management System (EMS)

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
</p>

---

#️⃣ **Korus Employee Management System (EMS)**

A full-stack Employee Management System (EMS) with a modern React (Vite + TypeScript + shadcn/ui + Tailwind CSS) frontend and a Node.js (Express + MongoDB) backend.


## 📑 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [API Endpoints](#api-endpoints)
- [Ports & Links](#ports--links)
- [Deployment](#deployment)


## 🛠️ Tech Stack

### Frontend

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=FFD62E" />
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white" />
  <img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat-square" />
</p>

- **React** (with Vite)
- **TypeScript**
- **shadcn/ui** (Radix UI)
- **Tailwind CSS**
- **React Router**
- **React Hook Form**
- **Zod** (validation)
- **Axios** (API requests)
- **Recharts** (charts)
- **Supabase** (optional, for auth/storage)
- **Other UI/utility libraries** (see `package.json`)

### Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/bcrypt-003A70?style=flat-square" />
  <img src="https://img.shields.io/badge/Multer-4A90E2?style=flat-square" />
  <img src="https://img.shields.io/badge/Nodemailer-009688?style=flat-square" />
</p>

- **Node.js** (ES Modules)
- **Express.js**
- **MongoDB** (via Mongoose)
- **JWT** (Authentication)
- **bcrypt** (Password hashing)
- **Multer** (File uploads)
- **Nodemailer** (Email)
- **dotenv** (Environment variables)
- **CORS**
- **Nodemon** (dev)

---

## Project Structure

```
NEW EMS/
  ├── frontend/   # React + Vite app (UI)
  └── backend/    # Node.js + Express API server
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- **MongoDB** (local or cloud)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- Runs on: [http://localhost:5173](http://localhost:5173) (default Vite port)

### Backend

```bash
cd backend
npm install
npm run dev
```

- Runs on: [http://localhost:5000](http://localhost:5000)
- Requires a `.env` file for MongoDB URI and JWT secret.

#### Example `.env` for backend

```
MONGO_URI=mongodb://localhost:27017/ems
JWT_SECRET=your_jwt_secret
```

---

## API Endpoints

All endpoints are prefixed with `/api/`.

### Auth

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| POST   | `/api/auth/login`       | User login                 |
| GET    | `/api/auth/verify`      | Verify user (JWT)          |
| POST   | `/api/auth/send-reset-otp` | Send password reset OTP |
| POST   | `/api/auth/reset-password` | Reset password           |

### Users

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/users/`           | Get all users              |
| GET    | `/api/users/:userId`    | Get user by ID             |
| DELETE | `/api/users/delete/:userId` | Delete user            |

### Departments

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/department/`      | Get all departments        |
| POST   | `/api/department/add`   | Add department             |
| PUT    | `/api/department/:_id`  | Update department          |
| DELETE | `/api/department/:_id`  | Delete department          |
| GET    | `/api/department/:_id`  | Get department by ID       |

### Employees

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/employees/`       | Get all employees          |
| POST   | `/api/employees/add`    | Add employee               |
| PUT    | `/api/employees/:_id`   | Update employee            |
| DELETE | `/api/employees/:_id`   | Delete employee            |
| PUT    | `/api/employees/edit-leave-balance/:employeeId` | Edit leave balance |
| PUT    | `/api/employees/update-journey/:employeeId`     | Update journey     |

### Holidays

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/holiday/`         | Get all holidays           |
| POST   | `/api/holiday/add`      | Add holiday                |
| PUT    | `/api/holiday/:_id`     | Edit holiday               |
| DELETE | `/api/holiday/:_id`     | Delete holiday             |

### Leaves

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/leaves/`          | Get all leaves             |
| GET    | `/api/leaves/get-user-leaves/:userId` | Get user leaves   |
| GET    | `/api/leaves/get-leaves-for-approval/:userId` | Leaves for approval |
| POST   | `/api/leaves/apply/:userId` | Apply for leave         |
| PUT    | `/api/leaves/edit/:_id` | Update leave               |
| DELETE | `/api/leaves/:_id`      | Delete leave               |
| POST   | `/api/leaves/:action/:leaveId` | Approve/Reject leave  |
| GET    | `/api/leaves/attachment/:leaveId` | Get leave attachment |
| POST   | `/api/leaves/update/ror/:leaveId` | Update reason of rejection |

### Allowances

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/allowances/`      | Get all allowances         |
| GET    | `/api/allowances/get-user-allowances/:userId` | Get user allowances |
| POST   | `/api/allowances/add`   | Add allowance              |
| PUT    | `/api/allowances/:_id`  | Update allowance           |
| DELETE | `/api/allowances/:_id`  | Delete allowance           |
| POST   | `/api/allowances/:action/:allowanceId` | Approve/Reject allowance |
| GET    | `/api/allowances/attachment/:_id` | Get allowance attachment |
| PUT    | `/api/allowances/add-voucher/:_id` | Add voucher number       |

### Fixed Allowances

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/fixed-allowances/`| Get all fixed allowances   |
| GET    | `/api/fixed-allowances/get-user-fixed-allowances/:userId` | Get user fixed allowances |
| POST   | `/api/fixed-allowances/add` | Add fixed allowance      |
| PUT    | `/api/fixed-allowances/:_id` | Update fixed allowance  |
| DELETE | `/api/fixed-allowances/:_id` | Delete fixed allowance  |
| GET    | `/api/fixed-allowances/attachment/:_id` | Get attachment      |
| PUT    | `/api/fixed-allowances/add-voucher/:_id` | Add voucher number |

### Helpdesk

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/helpdesk/`        | Get all helpdesk tickets   |
| POST   | `/api/helpdesk/add`     | Apply for helpdesk         |
| PUT    | `/api/helpdesk/:_id`    | Update helpdesk ticket     |
| DELETE | `/api/helpdesk/:_id`    | Delete helpdesk ticket     |
| PUT    | `/api/helpdesk/resolve-help/:_id` | Resolve ticket        |
| PUT    | `/api/helpdesk/add-response/:helpId` | Add response        |
| GET    | `/api/helpdesk/get-user-helpdesks/:userId` | Get user tickets  |

### Appraisals

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/appraisals/`      | Get all appraisals         |
| POST   | `/api/appraisals/add`   | Add appraisal              |
| PUT    | `/api/appraisals/:id`   | Edit appraisal             |
| DELETE | `/api/appraisals/delete-appraisal/:id` | Delete appraisal   |
| GET    | `/api/appraisals/get-user-appraisals/:userId` | Get user appraisals |
| GET    | `/api/appraisals/view-appraisals-teamlead/:userId` | Team lead view   |

### Salary

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/salary/`          | Get all salaries           |
| POST   | `/api/salary/add`       | Add salary                 |
| PUT    | `/api/salary/:_id`      | Update salary              |
| DELETE | `/api/salary/:_id`      | Delete salary              |
| GET    | `/api/salary/get-user-salaries/:userId` | Get user salaries |

### CTC

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/ctc/monthly/:month/:year` | Get month-wise CTC   |
| GET    | `/api/ctc/yearly/:year`         | Get year-wise CTC    |
| GET    | `/api/ctc/employee/:employeeId` | Get employee CTC     |

### Messages

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| GET    | `/api/message/get-all-messages` | Get all messages     |
| POST   | `/api/message/add-message`      | Add message          |
| POST   | `/api/message/edit-message/:messageId` | Edit message      |
| DELETE | `/api/message/delete-message/:messageId` | Delete message   |
| GET    | `/api/message/get-users-message/:userId` | Get user's messages |
| GET    | `/api/message/get-message-by-id/:messageId` | Get message by ID |
| POST   | `/api/message/reply-message/:messageId` | Reply to message  |

---

## Ports & Links

- **Frontend**: [http://localhost:8080](http://localhost:8080)
- **Backend**: [http://localhost:5000](http://localhost:5000)
- **Production Frontend**: [https://korus-ems.vercel.app](https://korus-ems.vercel.app)
- **Production Backend**: [https://korus-ems-backend.vercel.app](https://korus-ems-backend.vercel.app)


## Deployment

- **Frontend**: Deployable on Vercel, Netlify, or any static host.
- **Backend**: Deployable on Vercel (serverless), Render, Heroku, or any Node.js host.
- **Custom Domain**: Supported via Vercel or your preferred provider.


---

**Feel free to contribute, open issues, or request features!**
