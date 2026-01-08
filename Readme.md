# 🚀 XCODE – DSA & Coding Practice Platform

**XCODE** is a full-stack **DSA & coding practice platform** that helps developers prepare for interviews by solving problems, running code in real time, and receiving **AI-powered step-by-step guidance**.

🌐 **Live Demo:** [https://xcode-eta.vercel.app/](https://xcode-eta.vercel.app/)

---

## ✨ Features

* 🧠 DSA problem-solving platform for interview preparation
* 📝 Online code editor using Monaco Editor
* ⚡ Run and submit code with Judge0
* 📊 Submission history and verdict tracking
* 🤖 AI assistance using Google Gemini

  * Hints-first approach
  * Step-by-step solution explanations
* 💬 AI chat for problem-related doubts
* 📚 Editorial section with structured explanations
* 🔐 Secure email & password authentication
* 🛡️ Role-based access control (User / Admin)
* 📦 Video solutions and media via Cloudinary
* 🌐 Fully deployed production-ready application

---

## 🛠️ Tech Stack

### Frontend

* React 19
* Vite
* React Router v7
* Redux Toolkit
* Tailwind CSS + DaisyUI
* Monaco Editor
* Axios
* React Hook Form
* Zod
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Redis
* JWT Authentication
* Judge0
* Google Gemini AI
* Cloudinary
* REST APIs

---

## 🚀 Deployment

* **Frontend:** Vercel
* **Backend:** Render

🔗 **Live URL:** [https://xcode-eta.vercel.app/](https://xcode-eta.vercel.app/)

---

## 🧩 Getting Started

### Clone Repository

```bash
git clone https://github.com/Hunterx15/XCODE.git
cd XCODE
```

---

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:3000
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend `.env`

```env
PORT=3000

DB_CONNECT_STRING=
JWT_KEY=

REDIS_HOST=
REDIS_PORT=
REDIS_PASS=

JUDGE0_KEY=

GEMINI_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 🧠 AI Integration

1. User requests help on a problem
2. AI provides hints first
3. AI then gives step-by-step explanations
4. AI understands full problem context

---

## ⚙️ Code Execution

* Powered by Judge0
* Secure sandboxed execution
* Supported languages:

  * C++
  * Java
  * JavaScript

---

## 📂 Project Structure

```
XCODE/
│── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   └── .env
│
│── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   └── main.jsx
│   └── vite.config.js
│
│── README.md
│── .gitignore
```

---

## 🎯 Target Audience

* College students
* Interview preparation
* Competitive programmers
* Beginners in DSA

---

## 🤝 Contributing

Contributions are welcome.

* Open issues
* Submit pull requests
* Suggest new features

---

## 📜 License

MIT License © 2025
**Author:** Hunterx15

