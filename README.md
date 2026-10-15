# Previa — Preschool AI Assistant & Operations OS

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-0D9488?style=for-the-badge&logo=github)](https://riteshparmar15.github.io/Previa/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Riteshparmar15/Previa)
[![.NET 10](https://img.shields.io/badge/.NET-10.0%20LTS-512BD4?style=for-the-badge&logo=dotnet)](https://dotnet.microsoft.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"Less paperwork. Better parent communication. More time for children."**

🌐 **Live Web Application**: [https://riteshparmar15.github.io/Previa/](https://riteshparmar15.github.io/Previa/)  
📂 **GitHub Repository**: [https://github.com/Riteshparmar15/Previa](https://github.com/Riteshparmar15/Previa)

**Previa** is a commercial, multi-tenant SaaS platform built for Indian preschools, daycare centres, and early-childhood learning institutes (with initial target focus on independent preschools in Vadodara and Gujarat).

---

## 🌟 Value Proposition & Core Capabilities

Indian preschool administrators and teachers spend 15+ hours weekly on manual paperwork, bilingual translation, fee tracking, and parent messaging. Previa automates operational burdens while maintaining educational excellence and strict child privacy:

1. **📢 WhatsApp-Ready AI Parent Notices**:
   - Generates polished, polite school circulars with bulleted highlights and emoji formatting optimized for WhatsApp parent groups.
   - Trilingual support: **English**, **Gujarati (ગુજરાતી)**, and **Hindi (हिन्दी)** with respectful preschool cultural greetings (`નમસ્તે વાલીશ્રી`, `सादर प्रणाम`).
   - Categories: Rainy Day Alerts, Illness/Health Circulars, PTM Reminders, Festival Celebrations (Navratri, Janmashtami, Diwali), Field Trips, and Emergency Closures.

2. **🎨 Play-Based Activity & Lesson Planner**:
   - Structured curriculum planning for early childhood stages: **Playgroup (1.5-2.5y)**, **Nursery (2.5-3.5y)**, **Junior KG (3.5-4.5y)**, and **Senior KG (4.5-5.5y)**.
   - Comprehensive plans complete with learning objectives, age-appropriate materials, step-by-step guidance, duration, ability adaptations, and mandatory adult supervision safety notes.

3. **📋 Classroom Attendance & CSV Reports**:
   - Minimal student record maintenance (preventing over-collection of sensitive child data).
   - Fast daily roll-call (Present, Absent, Late, Excused) with database unique constraints preventing duplicate daily records.
   - Daily attendance percentage metrics and authorized CSV report export for auditing.

4. **💰 Gentle Fee Reminder Assistant**:
   - Generates considerate, culturally sensitive fee reminders in regional languages from manual school fee records.
   - WhatsApp-ready format with student roll numbers, fee periods, and payment due dates.

5. **📚 Preschool Template Library**:
   - Pre-seeded system templates for common preschool events and emergencies.
   - Ability for centres to save, duplicate, and customize templates for their campus.

6. **🔒 Multi-Tenant Enterprise Security**:
   - Robust tenant isolation enforced in every database query, cache key, and business logic layer.
   - BCrypt password hashing, JWT Bearer tokens with short-lived access and secure refresh mechanisms.
   - Strict Child Data Privacy Pledge: No collection of children photos, biometric data, or live location tracking.

---

## 🛠️ Technology Stack

### Backend (.NET 10 Web API)
- **Framework**: C# / ASP.NET Core Web API (.NET 10.0 LTS)
- **Architecture**: Modular Clean Architecture (Domain, Application, Infrastructure, API, Automated Tests)
- **ORM & Database**: Entity Framework Core with dual database support:
  - **Local Development / Fast Testing**: Relational SQLite database engine with foreign key enforcement.
  - **Production Deployment**: MySQL 8 (Pomelo MySQL Provider).
- **Security & Auth**: ASP.NET Core Authentication with short-lived JWT Access Tokens, BCrypt password hashing, and role-based policies (`Owner`, `Administrator`, `Teacher`, `ReadOnlyStaff`).
- **Validation**: FluentValidation with automatic pipeline validation.
- **AI Abstraction**: Pluggable `IAiAssistantService` supporting real LLM endpoints (OpenAI / Claude / Gemini / DeepSeek) alongside an offline domain-specific preschool synthesis engine for resilient local operation.
- **Health Checks & Telemetry**: ASP.NET Core `/health` endpoint and Serilog structured logging.

### Frontend (React 19 + TypeScript + Vite)
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS tailored to preschool SaaS aesthetics (warm off-white background `#FBFBF9`, soft teal `#0D9488`, slate typography, rounded cards).
- **Routing & State**: React Router v7, `@tanstack/react-query` for cached server synchronization.
- **Form Management**: React Hook Form with Zod schema validation.
- **Icons**: Lucide React.

---

## 🚀 Quick Start Guide

### Prerequisites
- [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js v20+ / v24+](https://nodejs.org/) & `npm`

### 1. Launch the Backend API

```powershell
# In the root repository directory:
dotnet build Previa.slnx
dotnet run --project src/Previa.Api/Previa.Api.csproj --launch-profile http
```

- API Base URL: `http://localhost:5123`
- Swagger UI Documentation: `http://localhost:5123/swagger`
- Health Check: `http://localhost:5123/health`

### 2. Launch the Frontend Client

```powershell
cd client
npm install
npm run dev
```

- Web Application: `http://localhost:5173`

---

## 🧪 Running Automated Tests

```powershell
# Run backend integration tests:
dotnet test tests/Previa.Tests/Previa.Tests.csproj

# Run live API end-to-end workflow verification:
powershell -ExecutionPolicy Bypass -File scratch/verify_api_workflow.ps1
```

---

## 📦 Commercial Subscription Tiers (Vadodara Pilot)

| Plan | Price (INR) | Max Students | Max Classes | Monthly AI Notices | Monthly Lesson Plans | Features |
|---|---|---|---|---|---|---|
| **Starter (Free Trial)** | ₹0 / ₹499 mo | 30 | 2 | 25 | 10 | Gujarati & English WhatsApp notices, daily attendance, basic templates |
| **Standard Centre** | ₹999 mo | 80 | 5 | 100 | 40 | Trilingual notices, custom templates, CSV export, fee reminders |
| **Growth Academy** | ₹1,999 mo | 250 | 15 | Unlimited (500) | Unlimited (200) | Multi-centre support, priority AI model, team role delegation |

---

## 📄 License & Attribution
Commercial SaaS Product © 2026 Previa EdTech Solutions. Designed for early childhood education excellence.
