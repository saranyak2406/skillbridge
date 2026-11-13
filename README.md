# SkillBridge – Online Learning & Skill Development Platform

SkillBridge is an industry-grade, production-ready full-stack educational SaaS platform that bridges students and instructors. Students can discover courses, enroll, stream video lessons, take automated quizzes, submit assignments, track their learning progress, and receive verifiable digital certificates. Instructors can publish courses, organize curriculum sections, manage assignments, and evaluate student work. Platform administrators maintain complete governance over courses, categories, users, and platform revenue analytics.

---

## 1. System Architecture

SkillBridge implements a decoupled, modern multi-tier client-server architecture:

```
[ React 18 + Vite Frontend ] (Port 5173)
         │  Axios HTTP / REST API (JWT Bearer Auth)
         ▼
[ Express.js + Node.js API Gateway ] (Port 5000)
   ├── Security: Helmet, CORS, Rate-Limiter
   ├── Authentication: JWT + bcryptjs
   ├── File Handling: Multer (Uploads)
   └── ORM/Driver: node-postgres (pg Pool)
         │  Parameterized SQL Queries / Transactions
         ▼
[ PostgreSQL Database (skillbridge_db) ] (Port 5432)
   └── 20 Normalized Relational Tables + Indexes + Constraints
```

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS, CSS3, PostCSS, Autoprefixer
- **Routing**: React Router DOM (v6)
- **HTTP Client**: Axios with request/response interceptors
- **Icons**: Lucide React
- **Analytics & Charts**: Recharts

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4)
- **Security**: Helmet, CORS, Express-Rate-Limit
- **Authentication**: JSON Web Tokens (JWT), bcryptjs password hashing
- **File Uploads**: Multer
- **Database Driver**: `pg` (node-postgres connection pool)
- **Certificate Generation**: PDFKit

### Database
- **Engine**: PostgreSQL 14+ (Installed: PostgreSQL 16)
- **Database Name**: `skillbridge_db`
- **Schema**: 20 Normalized Relational Tables with Foreign Keys, Cascades, Check Constraints, and B-Tree Indexes.

---

## 3. Project Directory Structure

```text
skillbridge/
├── .gitignore
├── .env.example
├── README.md
├── backend/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── validators/
│   ├── utils/
│   ├── database/
│   │   ├── schema.sql
│   │   ├── initDb.js
│   │   └── seed.js
│   └── uploads/
│       └── .gitkeep
└── frontend/
    ├── .env.example
    ├── .env
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── public/
    │   └── vite.svg
    └── src/
        ├── assets/
        ├── components/
        ├── pages/
        ├── layouts/
        ├── services/
        │   └── api.js
        ├── context/
        ├── hooks/
        ├── routes/
        ├── utils/
        ├── App.jsx
        ├── index.css
        └── main.jsx
```

---

## 4. PostgreSQL Database Schema (20 Tables)

1. `users`: Core identity table (id, full_name, email, password_hash, role, profile_image, is_active, created_at, updated_at).
2. `student_profiles`: Extended student bio, education, and learning interests.
3. `instructor_profiles`: Instructor expertise, qualifications, teaching experience, and bio.
4. `categories`: Course subject taxonomy (Web Dev, AI, Cloud, Mobile, UI/UX, Security).
5. `courses`: Core course entity with pricing, difficulty, status, instructor reference, and category reference.
6. `course_sections`: Modules/chapters organizing course content.
7. `lessons`: Individual video lectures, durations, downloadable resources, and ordering.
8. `enrollments`: Course registration, enrollment status, and payment state.
9. `lesson_progress`: Granular per-student lesson completion tracking.
10. `quizzes`: Assessments linked to courses or specific sections with passing criteria.
11. `questions`: Multiple-choice questions with allocated marks.
12. `question_options`: Answer choices with boolean correctness flags.
13. `quiz_attempts`: Student attempt sessions, scores, and pass/fail states.
14. `quiz_answers`: Individual student answers for each question in an attempt.
15. `assignments`: Practical project tasks with instructions and submission deadlines.
16. `assignment_submissions`: Student uploaded files, instructor grading, and feedback.
17. `certificates`: Verifiable course completion credentials with unique IDs and URLs.
18. `reviews`: Course ratings (1-5 stars) and student testimonials.
19. `payments`: Financial transaction records with gateway tracking IDs.
20. `notifications`: Platform alerts and event notifications for users.

---

## 5. Quick Start Instructions (Windows PowerShell)

### Step 1: Start PostgreSQL Service
Ensure PostgreSQL 16 is running on your machine:
```powershell
Start-Service -Name postgresql-x64-16
```

### Step 2: Configure Environment Variables
Verify or edit `backend/.env` with your PostgreSQL password:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillbridge_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=skillbridge_jwt_secret_dev_key_2026_x89a_skillbridge
CLIENT_URL=http://localhost:5173
```

### Step 3: Initialize Database & Seed Data
Run the automated database creation, schema application, and seed scripts:
```powershell
cd backend
npm run db:init
npm run db:seed
```

### Step 4: Run Backend Server
```powershell
npm run dev
# Server runs on http://localhost:5000
```

### Step 5: Run Frontend Application
Open a new PowerShell terminal:
```powershell
cd frontend
npm run dev
# Vite runs on http://localhost:5173
```

---

## 6. Seed Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@skillbridge.com` | `Admin@123` | Full platform control, approvals, analytics |
| **Instructor** | `instructor@skillbridge.com` | `Instructor@123` | Course creation, quizzes, grading |
| **Student** | `student@skillbridge.com` | `Student@123` | Enrollment, learning, assessments |

