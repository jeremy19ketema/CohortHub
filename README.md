# CohortHub - Role-Based Learning Platform

A comprehensive learning management system with **Role-Based Access Control**, **Quiz-Gated Progression**, and **Auto-Generated PDF Certificates**.

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Schema](#-database-schema)
- [Setup & Installation](#-setup--installation)
- [Demo Accounts](#-demo-accounts)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Features

### Core Features

| Feature                    | Description                               |
| -------------------------- | ----------------------------------------- |
| 🔐 **Authentication**      | JWT-based with access & refresh tokens    |
| 👤 **Authorization**       | Three roles: Student, Instructor, Admin   |
| 🔒 **Password Hashing**    | bcrypt with 12 salt rounds                |
| 📊 **Logging**             | Winston logger for application monitoring |
| 🏗️ **MVC Architecture**    | Models, Views, Controllers separation     |
| 🗄️ **Relational Database** | PostgreSQL with proper schema design      |

### Extra Features (Beyond Course Scope)

| Feature                           | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| 📜 **PDF Certificate Generation** | Auto-generated on cohort completion using PDFKit |
| 🚦 **Rate Limiting**              | API protection against abuse                     |
| ✅ **Input Validation**           | Joi schema validation on all endpoints           |
| 🔄 **Refresh Token Rotation**     | Enhanced JWT security                            |
| 📝 **Audit Logging**              | Track user actions                               |
| 🔓 **Quiz-Gated Progression**     | Sequential module unlocking via quiz completion  |
| 📹 **Video Content Support**      | YouTube embedding in modules                     |
| 💬 **Discussion Forums**          | Cohort-based discussions with replies            |
| 📢 **Announcements**              | Instructor announcements with importance flag    |
| 📱 **Responsive Design**          | Mobile-friendly interface                        |

---

## 📋 Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+
- **ORM/Query Builder**: pg (node-postgres)
- **Authentication**: JWT, bcryptjs
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit

### Frontend

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Flexbox, Grid
- **JavaScript** - Vanilla JS, ES6+
- **Fonts**: Fraunces, Public Sans, IBM Plex Mono

### DevOps & Tools

- **Package Manager**: npm
- **Development**: nodemon
- **Environment**: dotenv
- **Version Control**: Git

---

## 🗄️ Database Schema

ER Diagram

### Key Relationships

Users ──┬── Instructs ──► Cohorts
├── Enrolls ────► Cohorts (through enrollments)
├── Creates ────► Discussions
├── Takes ──────► Quizzes (through quiz_attempts)
└── Earns ──────► Certificates

Cohorts ──┬── Contains ──► Modules
├── Has ───────► Enrollments
└── Has ───────► Discussions

Modules ──┬── Contains ──► Content Blocks
├── Has ───────► Quizzes
└── Tracks ────► Module Progress

Quizzes ──┬── Contains ──► Questions
└── Has ───────► Quiz Attempt

🛠️ Setup & Installation

# 1. Clone repository

git clone <https://github.com/jeremy19ketema/CohortHub.git>

cd cohorthub

# 2. Install dependencies

npm install

# 3. Configure environment

cp .env.example .env

# Edit .env with your database credentials and JWT secrets

# 4. Create PostgreSQL database

psql -U postgres -c "CREATE DATABASE cohort_hub;"

# 5. Run migrations and seed data

npm run db:migrate

# 6. Start development server

npm run dev

# 7. Access application

Open http://localhost:3000 in your browser
