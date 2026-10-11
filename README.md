# 🚀 Elevora AI — All-in-One Developer Hub & Coding Companion

**Elevora AI** is an advanced developer platform engineered for programmers, job seekers, and computer science students. Built with a sleek dark cyberpunk aesthetic, it unifies intelligent code analysis, dynamic AI goal roadmap generation, ATS-optimized AI resume synthesis, multi-language cheat sheet PDF library with custom file uploads, and skill-building quizzes with live level-adaptive question generation.

---

## 🌟 Core Features

### 1. 🎯 AI Day-by-Day Goal & Roadmap Planner (30-Day Roadmaps)
- **Custom Duration Input**: Set any target duration (e.g. 7 days, 14 days, 30 days, 60 days, 90 days).
- **AI Roadmap Synthesis**: Analyzes your goal (e.g. *"Learn Python Basics"*, *"Master LeetCode Blind 75"*) and automatically generates a comprehensive day-by-day plan with an actionable task for every single day.
- **Tickable Subtasks**: Interactive checkboxes allow you to tick off each daily task as you complete it, with live percentage calculation and celebratory confetti.
- **Multi-View Progress Trackers**:
  - ☀️ **Day Tracker (Daily Focus)**: Focuses strictly on today's tasks across all your active roadmaps with a 1-click check-in.
  - 📅 **Week Tracker (7-Day Sprint)**: 7-day card breakdown showing daily sprint tasks, weekly velocity, and completion rate.
  - 🗓️ **Monthly Tracker (30-Day Grid Matrix)**: Interactive 30-day matrix showing completed days in glowing emerald, today's day highlighted in pulsing cyan, and upcoming days with click-to-view details.

### 2. 🗄️ Free Best Database & Full Authentication (SQLite)
- **ACID Native SQLite Storage**: Powered by Node 24 native `node:sqlite` (`DatabaseSync`), storing users, sessions, goals, subtasks, uploaded PDFs, and streaks in `elevora.db` with zero configuration and zero external npm dependencies.
- **Secure Authentication**: PBKDF2/SHA-512 password hashing, salt generation, session tokens, and automatic demo account seeding.
- **Seamless Offline Fallback**: Also synchronizes with client-side localStorage/IndexedDB, allowing Elevora to run smoothly both with the Node server and directly via standalone browser launch (`index.html`).

### 3. 📚 Cheat Sheet PDF Hub with In-App Upload, Reader & Downloader
- **Curated Multi-Language Reference Cards**: Python 3.12+, Java 21 LTS, Modern JavaScript, SQL, TypeScript, C++, React 19, and Git.
- **Upload Custom PDFs**: Drag and drop or browse to upload any `.pdf` document directly into Elevora.
- **Interactive In-App Reader**: Embedded PDF reader allows you to read your uploaded PDFs and notes right inside the application.
- **Direct PDF Download**: Download original uploaded PDFs or generate formatted multi-page vector cheat sheets via `jsPDF`.

### 4. 🏆 Dynamic AI Quizzes (Beginner, Intermediate, Pro)
- **Track Selection**: Choose from Python, JavaScript, TypeScript, Java, C++, SQL, React, or DSA.
- **Proficiency Level Selector**: Select **🟢 Beginner**, **🟡 Intermediate**, or **🔴 Pro**.
- **Dynamic AI Question Synthesis**: Generates challenging real-world coding questions with syntax code blocks, 4 multiple choice options, real-time evaluation, and in-depth pedagogical explanations.
- **Gamified XP Progression**: Earn +50 XP (Beginner), +100 XP (Intermediate), and +150 XP (Pro) to level up your developer title from *Junior Craftsman* to *Principal Staff Architect*.

### 5. 🤖 AI Code Assistant & ChatGPT Doubt Solver
- **File Upload & Drag-and-Drop**: Upload code in Python, Java, JS, TS, C++, SQL, HTML, CSS.
- **Line-Numbered Code Window**: Dark editor with tab indentation and language selector.
- **Power Tools**: Explain code architecture, find syntax/logic bugs with fixes, optimize runtime speed, and generate automated test suites.
- **ChatGPT Developer Doubt Solver**: Ask any conceptual coding doubt, architecture question, or interview trap.

### 6. 📄 AI Developer Resume Builder
- **ATS-Optimized Formatting**: Contact details, executive summary, technical skills, work experience, projects, and education.
- **AI Action-Verb Enhancer**: Rewrites generic bullet points into quantified engineering accomplishments.
- **Live Dual Preview**: Clean ATS White print-ready theme and Dark Cyberpunk preview with 1-click vector PDF export.

---

## 🛠️ How to Run

### Method 1: One-Click Windows Launcher
Double-click `start.bat` in this folder:
```cmd
start.bat
```

### Method 2: Node.js Server
Run with Antigravity Node runtime or standard Node:
```powershell
& "$env:USERPROFILE\AppData\Roaming\Antigravity\bin\agy-node.cmd" server.js
```
Or with system Node.js:
```powershell
node server.js
```
Then open your browser at:
```
http://localhost:3000
```

### Method 3: Standalone Browser Launch
Open `index.html` directly in Google Chrome, Microsoft Edge, or Firefox!

---

## 🎨 Theme & Aesthetic
- **Void Obsidian Background**: `#070a12`
- **Surface & Panels**: `#0d121f`
- **Card Containers**: `#121929`
- **Accents**: Cyan `#06b6d4`, Emerald `#10b981`, Purple `#8b5cf6`, Rose `#f43f5e`, Amber `#f59e0b`
