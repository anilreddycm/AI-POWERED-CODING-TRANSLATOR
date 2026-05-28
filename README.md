<div align="center">

# ⚡ AI-Powered Code Translator

### Translate, Analyze, Explain & Optimize Code Across 12 Languages — Powered by Google Gemini

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Gemini](https://img.shields.io/badge/Gemini_2.5-Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

<br/>

A full-stack MERN web application that leverages **Google's Gemini 2.5 Flash** LLM to provide intelligent code translation between programming languages, Big-O complexity analysis, plain-English code explanations, and AI-driven performance optimizations — all from a professional Monaco-powered editor interface.

<br/>

</div>

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔄 **Code Translation** | Translate code seamlessly between **12 programming languages** while preserving logic, structure, and comments |
| 📊 **Complexity Analysis** | Get detailed **Big-O time & space complexity** breakdowns with step-by-step reasoning |
| 💡 **Code Explanation** | Receive clear, structured explanations of code in **plain English** — ideal for learning or code reviews |
| ⚡ **Code Optimization** | AI-suggested performance improvements with **before/after analysis** and measurable gains |
| 🔐 **Authentication** | Full auth system with **email/password registration + Google OAuth 2.0** sign-in |
| 📝 **History Tracking** | Paginated history of all past operations with **detailed modal views** for revisiting results |
| 🖥️ **Monaco Editor** | Professional-grade code editor (same engine as VS Code) with **syntax highlighting** for all supported languages |
| 🛡️ **Resilient Backend** | Automatic **file-based JSON fallback** when MongoDB is unavailable — the app never crashes |

---

## 🌐 Supported Languages

<div align="center">

`JavaScript` · `TypeScript` · `Python` · `Java` · `C++` · `C#` · `Go` · `Rust` · `Ruby` · `PHP` · `HTML` · `CSS`

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (React 19 + Vite 6)             │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐  │
│  │  Login   │  │  Code Editor │  │  Output   │  │  History  │  │
│  │  Page    │  │  (Monaco)    │  │  Panel    │  │  Page     │  │
│  └────┬─────┘  └──────┬───────┘  └─────┬─────┘  └─────┬─────┘  │
│       │  Google OAuth  │   Axios        │              │        │
│       └───────┬────────┴────────────────┴──────────────┘        │
└───────────────┼─────────────────────────────────────────────────┘
                │  REST API (JWT Protected)
┌───────────────┼─────────────────────────────────────────────────┐
│               ▼          SERVER (Express 5 + Node.js)           │
│  ┌────────────────────┐  ┌──────────────────────────────────┐   │
│  │  Auth Controller   │  │  Code Controller                 │   │
│  │  • Register        │  │  • /translate  → Translation Svc │   │
│  │  • Login           │  │  • /complexity → Complexity Svc  │   │
│  │  • Google OAuth    │  │  • /explain    → Explanation Svc │   │
│  │  • Logout          │  │  • /optimize   → Optimization Svc│   │
│  └────────┬───────────┘  └──────────┬───────────────────────┘   │
│           │                         │                           │
│           │                         ▼                           │
│           │              ┌─────────────────────┐                │
│           │              │   Gemini 2.5 Flash   │                │
│           │              │   (Google GenAI SDK)  │                │
│           │              └─────────────────────┘                │
│           ▼                                                     │
│  ┌─────────────────────────────────────────┐                    │
│  │  Database Layer (Adapter Pattern)       │                    │
│  │  ├─ MongoDB Atlas (primary)             │                    │
│  │  └─ JSON File DB (automatic fallback)   │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI library with hooks and context for state management
- **Vite 6** — Lightning-fast build tool and dev server
- **Monaco Editor** — VS Code's editor engine for professional code editing
- **React Router v7** — Client-side routing with protected routes
- **Google OAuth** — One-click Google sign-in via `@react-oauth/google`
- **Axios** — HTTP client for API communication
- **React Hot Toast** — Elegant notification system

### Backend
- **Express 5** — Modern Node.js web framework
- **MongoDB + Mongoose 9** — Document database with Atlas cloud hosting
- **Google GenAI SDK** — Official SDK for Gemini 2.5 Flash integration
- **JWT (jsonwebtoken)** — Stateless authentication with Bearer tokens
- **bcryptjs** — Secure password hashing with salt rounds
- **Google Auth Library** — Server-side Google OAuth token verification

---

## 📁 Project Structure

```
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CodeEditor.jsx       # Monaco Editor wrapper
│   │   │   ├── HistoryList.jsx      # History entries list
│   │   │   ├── LanguageSelector.jsx # Language dropdown
│   │   │   ├── Navbar.jsx           # Navigation bar with auth
│   │   │   ├── OutputPannel.jsx     # Results display + markdown renderer
│   │   │   └── ProtectedRoute.jsx   # Auth guard for routes
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Global auth state (React Context)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx         # Main editor + action panel
│   │   │   ├── HistoryPage.jsx      # Paginated history with modals
│   │   │   └── LoginPage.jsx        # Sign in / Sign up + Google OAuth
│   │   ├── services/                # API service layer (Axios)
│   │   └── styles/                  # Component-scoped CSS
│   └── vite.config.js
│
├── server/                          # Backend (Express + Node.js)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.config.js         # MongoDB connection + DNS fallback
│   │   │   ├── env.config.js        # Environment variable loader
│   │   │   ├── gemini.config.js     # Gemini AI client setup
│   │   │   └── google.config.js     # Google OAuth2 client
│   │   ├── constants/
│   │   │   ├── languages.js         # Supported language definitions
│   │   │   └── prompts.js           # Engineered system prompts for LLM
│   │   ├── controllers/             # Request handlers
│   │   ├── middleware/              # Auth guard + error handlers
│   │   ├── models/                  # Mongoose schemas + file DB adapters
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/                # Business logic layer
│   │   └── utils/                   # JWT helpers + prompt formatters
│   └── server.js                    # Entry point
│
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB Atlas** account (or the app auto-falls back to local JSON files)
- **Google Gemini API Key** — [Get one free at Google AI Studio](https://aistudio.google.com/apikey)
- **Google OAuth Client ID** — [Create at Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 1. Clone the Repository

```bash
git clone https://github.com/anilreddycm/AI-POWERED-CODING-TRANSLATOR.git
cd AI-POWERED-CODING-TRANSLATOR
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `server/.env` file:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:

```bash
npm run dev
```

### 3. Setup the Client

```bash
cd client
npm install
```

Create a `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the client:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🔌 API Endpoints

All `/api/code/*` and `/api/history/*` routes require a valid JWT token in the `Authorization: Bearer <token>` header.

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register with email/password | ❌ |
| `POST` | `/api/auth/login` | Login with email/password | ❌ |
| `POST` | `/api/auth/google` | Login with Google OAuth token | ❌ |
| `POST` | `/api/auth/logout` | Logout (stateless) | ✅ |
| `POST` | `/api/code/translate` | Translate code between languages | ✅ |
| `POST` | `/api/code/complexity` | Analyze time/space complexity | ✅ |
| `POST` | `/api/code/explain` | Explain code in plain English | ✅ |
| `POST` | `/api/code/optimize` | AI-powered code optimization | ✅ |
| `GET` | `/api/history` | Get paginated user history | ✅ |
| `GET` | `/api/history/:id` | Get specific history entry | ✅ |
| `DELETE` | `/api/history/:id` | Delete a history entry | ✅ |
| `DELETE` | `/api/history` | Clear all user history | ✅ |

---

## 🧠 Technical Highlights

- **Multi-Provider AI Fallback & Key Rotation** — Features a resilient AI routing system that rotates multiple API keys round-robin per provider and cascades across multiple AI providers (Google Gemini → Groq → OpenRouter) to maximize free-tier limits, prevent rate-limiting, and guarantee high availability.

- **Adapter Pattern for Database Resilience** — The data models implement a dual-storage adapter that automatically switches between MongoDB Atlas and a local JSON file-based database. If the MongoDB connection fails, the app seamlessly continues operating with zero downtime.

- **Engineered LLM System Prompts** — Each AI feature (translate, analyze, explain, optimize) uses carefully crafted system-level prompts to ensure consistent, structured, and high-quality outputs from Gemini 2.5 Flash.

- **Custom Markdown Renderer** — The output panel includes a built-in markdown parser that renders headings, bold text, inline code, bullet lists, and fenced code blocks with full Monaco Editor syntax highlighting — no external markdown library needed.

- **DNS Fallback for Restricted Networks** — The MongoDB connection logic includes automatic DNS resolver switching (to Google DNS `8.8.8.8`) when corporate or restricted networks block SRV record resolution.

- **Stateless JWT Authentication** — Token-based auth with bcrypt password hashing, Google OAuth2 server-side verification, and protected route middleware on both frontend and backend.

---

## 📄 License

This project is open source and available under the [ISC License](https://opensource.org/licenses/ISC).

---

<div align="center">

**Built with ❤️ by [Anil Reddy](https://github.com/anilreddycm)**

</div>
