# 🖥️ Computer-Based Testing (CBT) System

A full-featured CBT platform tailored for tertiary institutions, designed to streamline the examination process for both **administrators** and **students**. It ensures secure, automated, and scalable digital assessments with real-time result tracking.

---

## ✨ Features

### 🔒 Admin Panel
- Create & manage multiple exams
- Add and edit questions (Multiple Choice, True/False, etc.)
- Assign exams to departments, courses, or students
- Monitor exam progress and student submissions in real time
- Automated result grading and analytics
- Role-based access control (e.g., super admin, exam officer)
- Export reports and performance summaries

### 🎓 Student App
- Register and log in securely
- Take assigned exams within a timed interface
- Auto-save answers as the student progresses
- Get instant feedback or results (based on settings)
- Access exam history and scores

---

## 🛠️ Tech Stack

| Area        | Technologies Used |
|-------------|-------------------|
| Frontend    | React.js · Tailwind CSS · Axios |
| Backend     | Node.js · Express · JWT Auth · Prisma ORM |
| Database    | PostgreSQL / MySQL (configurable) |
| Tools       | Git · GitHub Actions · Postman · Docker (optional) |

---

## 📦 Folder Structure

cbt-system/
├── admin-frontend/ # Admin dashboard
├── student-frontend/ # Student exam interface
└── backend/ # REST API and DB logic


---

## 🚀 Getting Started

### Clone the Repository
    ```bash
      git clone https://github.com/your-username/cbt-system.git
      cd cbt-system

### Set up the Backend
    ```bash
      cd backend
      npm install
      npx prisma migrate dev
      npm nodemon src/server.js

### Set up Admin Frontend
    ```bash
      cd admin-frontend
      npm install
      npm run dev

### Set up Admin Frontend
    ```bash
      cd student-frontend
      npm install
      npm run dev

---

## 📌 Upcoming Features

- Exam result export (CSV/Excel)
- Advanced analytics with charts
- Question randomization & anti-cheating measures
- SMS/Email exam notifications

---

## 📬 Contact & Contribution

Pull requests and contributions are welcome!

For support or questions:  
📧 **ahakiricosmas@gmail.com**  
🔗 [LinkedIn](https://linkedin.com/in/ahakiri-uke-444619351/)

---

## 🧠 License

This project is open source and available under the [MIT License](LICENSE).

