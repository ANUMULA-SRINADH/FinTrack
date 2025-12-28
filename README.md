
# 🚀 FinTrack: Full-Stack Financial Management System

**FinTrack** is a professional-grade personal finance dashboard built to demonstrate modern full-stack engineering principles. It allows users to track expenses, visualize spending habits via interactive charts, and generate executive financial reports.

## 🛠️ Tech Stack

### **Backend (The Engine)**

* **FastAPI:** High-performance Python framework for building APIs.
* **SQLAlchemy:** ORM for database management (SQLite/PostgreSQL ready).
* **JWT (JSON Web Tokens):** Secure OAuth2-based authentication.
* **Bcrypt:** Industry-standard password hashing.

### **Frontend (The Experience)**

* **React.js:** Component-based UI development.
* **Tailwind CSS:** Modern utility-first styling for a sleek MNC-ready look.
* **Recharts:** Data visualization for monthly trends and category breakdowns.
* **Lucide React:** Premium iconography.

---

## ✨ Key Features

* **🔒 Secure Authentication:** Full Signup/Login flow using JWT tokens and persistent sessions.
* **📊 Interactive Analytics:** Dynamic Pie and Bar charts that update in real-time as transactions are added or deleted.
* **🎯 Budget Management:** A "Budget Goal" tracker with visual "Nudges" (Color-coded progress bars) as users approach their limits.
* **🔍 Advanced Data Filtering:** Live search and category-based filtering for efficient record management.
* **📄 Executive Reporting:** One-click PDF report generation that captures both data tables and visual charts.

---

## 🏗️ System Architecture

The system follows a **decoupled architecture**:

1. **Client Layer:** React handles the state management and UI rendering.
2. **API Layer:** FastAPI serves as the gateway, handling authentication middleware and business logic.
3. **Data Layer:** SQLAlchemy manages the persistence of User and Transaction models.

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start

```

---

## 📈 Future Roadmap

* [ ] **Multi-Currency Support:** Integration with external APIs for real-time exchange rates.
* [ ] **AI Spending Insights:** Automated categorization using machine learning.
* [ ] **Mobile App:** Cross-platform support via React Native.

