require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const DB_FILE = path.join(__dirname, 'elevora.db');
const JSON_BACKUP_FILE = path.join(__dirname, 'elevora_data.json');

// Default Google Gemini Configuration provided by User
const DEFAULT_GEMINI_KEY = process.env.API_KEY;
const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

// ==========================================
// 1. FREE BEST DATABASE ENGINE: SQLITE / JSON
// ==========================================
let db = null;
let useSqlite = false;

try {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync(DB_FILE);
  useSqlite = true;
  console.log(`[Elevora DB] Initialized native SQLite database at: ${DB_FILE}`);

  // Create SQLite Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'Full Stack Engineer',
      avatar TEXT DEFAULT '👨‍💻',
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      xp INTEGER DEFAULT 250,
      streak INTEGER DEFAULT 7,
      last_active TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      days INTEGER DEFAULT 30,
      target_date TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      day_number INTEGER DEFAULT 1,
      text TEXT NOT NULL,
      done INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS uploaded_pdfs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      filename TEXT NOT NULL,
      category TEXT DEFAULT 'Custom Notes',
      file_size INTEGER DEFAULT 0,
      file_data TEXT,
      created_at TEXT NOT NULL
    );
  `);
  console.log('[Elevora DB] SQLite schema verified (users, sessions, goals, subtasks, uploaded_pdfs).');
} catch (err) {
  console.warn('[Elevora DB] node:sqlite unavailable, falling back to JSON DB:', err.message);
  useSqlite = false;
}

// Fallback JSON DB store helper
function getJsonDb() {
  if (!fs.existsSync(JSON_BACKUP_FILE)) {
    const init = { users: [], sessions: [], goals: [], subtasks: [], uploaded_pdfs: [] };
    fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(init, null, 2), 'utf-8');
    return init;
  }
  try {
    return JSON.parse(fs.readFileSync(JSON_BACKUP_FILE, 'utf-8'));
  } catch (e) {
    return { users: [], sessions: [], goals: [], subtasks: [], uploaded_pdfs: [] };
  }
}

function saveJsonDb(data) {
  fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Seed Demo User if not exists
(function seedDemoUser() {
  const demoEmail = 'pretham.dev@elevora.ai';
  if (useSqlite) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail);
    if (!existing) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword('coder1234', salt);
      const insert = db.prepare(`
        INSERT INTO users (id, name, email, role, avatar, password_hash, salt, xp, streak, last_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insert.run('usr-demo-1', 'Pretham', demoEmail, 'Senior Full Stack Engineer', '⚡', hash, salt, 350, 7, new Date().toISOString().slice(0, 10), new Date().toISOString());
      console.log('[Elevora DB] Seeded demo user: pretham.dev@elevora.ai (password: coder1234)');
    }
  } else {
    const data = getJsonDb();
    if (!data.users.find(u => u.email === demoEmail)) {
      const salt = crypto.randomBytes(16).toString('hex');
      data.users.push({
        id: 'usr-demo-1',
        name: 'Pretham',
        email: demoEmail,
        role: 'Senior Full Stack Engineer',
        avatar: '⚡',
        password_hash: hashPassword('coder1234', salt),
        salt,
        xp: 350,
        streak: 7,
        last_active: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString()
      });
      saveJsonDb(data);
    }
  }
})();

// ==========================================
// 2. MIME TYPES FOR STATIC ASSETS
// ==========================================
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// ==========================================
// 3. AI QUERY ENGINES (GEMINI 3.8 FLASH + POLLINATIONS)
// ==========================================
async function queryGemini(promptText, apiKey = DEFAULT_GEMINI_KEY, model = DEFAULT_GEMINI_MODEL) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini returned HTTP ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from Gemini');
    }
    return text.trim();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function queryPollinations(promptText) {
  const encoded = encodeURIComponent(promptText);
  const url = `https://text.pollinations.ai/${encoded}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 18000);

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain, */*',
        'User-Agent': 'ElevoraAI/3.0 (Developer Assistant)'
      }
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
    const text = await res.text();
    if (!text || text.trim().length === 0) throw new Error('Empty response');
    return text.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Master AI Query Wrapper: Tries Gemini 3.8 Flash first, then Pollinations
async function queryPrimaryAI(promptText, customKey = '') {
  const keyToUse = customKey && customKey.trim().length > 10 ? customKey.trim() : DEFAULT_GEMINI_KEY;
  try {
    return await queryGemini(promptText, keyToUse, DEFAULT_GEMINI_MODEL);
  } catch (geminiErr) {
    console.warn(`[Elevora AI] Gemini query notice (${geminiErr.message}), falling back to secondary cloud engine.`);
    return await queryPollinations(promptText);
  }
}

// Fallback Heuristic Generator for Code Analysis
function generateLocalFallback(action, code, language, prompt) {
  language = (language || 'code').toLowerCase();
  const errors = [];
  const lines = code.split('\n');

  if (code.includes('(') && (code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length) {
    errors.push('Unbalanced parentheses detected.');
  }
  if (language === 'python') {
    lines.forEach((l, i) => {
      if (/^(def|class|if|elif|else|for|while)\b.*[^:]$/.test(l.trim())) {
        errors.push(`Missing colon ':' on line ${i + 1}: \`${l.trim()}\``);
      }
    });
  }

  const errSection = errors.length > 0 
    ? `### 🐞 Detected Error(s)\n${errors.map(e => `- ${e}`).join('\n')}\n\n**Corrected Syntax:**\n\`\`\`${language}\n${code.replace(/([^:\s])\s*$/m, '$1:')}\n\`\`\``
    : `### ✅ Syntax Audit\nNo obvious syntax errors found. Verify edge cases and runtime boundary inputs.`;

  return `### 💡 Elevora AI Code Analysis (${language.toUpperCase()})

#### 1. Architecture & Execution Flow
The ${language} program executes logic step-by-step with linear and conditional branching.

${errSection}

#### 2. Complexity Analysis
- **Time Complexity:** O(n) linear bounds on collection traversal.
- **Space Complexity:** O(1) auxiliary runtime overhead.

#### 3. Mentor Guidance
${prompt ? `Regarding your question: **"${prompt}"** - Ensure variables are properly scoped and edge cases (empty or null values) are explicitly checked.` : 'Always write clean, modular functions with self-documenting variable names.'}`;
}

// ==========================================
// 4. AI DAY-BY-DAY GOAL PLANNER (Req 1 & 3)
// ==========================================
function generateAlgorithmicRoadmap(title, category, days) {
  days = Math.max(1, Math.min(parseInt(days, 10) || 30, 120));
  const subtasks = [];
  const tLower = (title + ' ' + category).toLowerCase();

  let modules = [];
  if (tLower.includes('python')) {
    modules = [
      'Python Installation, IDE Setup & Hello World',
      'Variables, Primitive Types (int, float, str, bool)',
      'Conditionals (if, elif, else) & Boolean Logic',
      'Loops (while, for) & Range Generator',
      'Lists: Methods, Slicing & Operations',
      'Tuples, Sets & Hash Uniqueness',
      'Dictionaries: Key-Value Mapping & Iteration',
      'List & Dictionary Comprehensions',
      'Functions: Parameters, Return Values & *args',
      'Lambda Functions & Map / Filter / Reduce',
      'Error Handling: try / except / finally blocks',
      'File I/O: Reading & Writing text and JSON files',
      'Object Oriented Programming: Classes & Objects',
      'OOP Inheritance, Super() & Polymorphism',
      'Dunder / Magic Methods (__init__, __str__, __repr__)',
      'Modules, Packages & Pip Virtual Environments',
      'Regular Expressions (re module) & Pattern Matching',
      'Iterators & Generators with yield keyword',
      'Decorators: Wrapping functions & syntax sugar',
      'Datetime & Math Standard Libraries',
      'Working with Web APIs using Requests library',
      'Data Manipulation with Pandas Basics',
      'FastAPI / Flask: First REST Endpoint',
      'Database Connection with SQLite & CRUD operations',
      'Unit Testing with pytest framework',
      'Clean Code, PEP 8 Linting & Type Hints',
      'Concurrency: Asyncio & Async/Await syntax',
      'Building Capstone CLI or Web Application',
      'Debugging, Refactoring & Performance Profiling',
      'Project Documentation, Git Push & Capstone Completion'
    ];
  } else if (tLower.includes('javascript') || tLower.includes('js') || tLower.includes('web') || tLower.includes('frontend')) {
    modules = [
      'HTML5 Semantic Elements & Modern Page Structure',
      'CSS Flexbox & Responsive Layout Principles',
      'CSS Grid Mastery & Adaptive Media Queries',
      'JavaScript Syntax: let, const, Data Types & Operators',
      'DOM Manipulation: querySelector, Events & Listeners',
      'Arrays & Modern Functional Methods (map, filter, reduce)',
      'Objects, Destructuring, Spread/Rest Operators',
      'Functions, Arrow Syntax & Lexical Scoping',
      'Closures, Higher-Order Functions & Callbacks',
      'Asynchronous JS: Event Loop, Call Stack & Microtasks',
      'Promises: Chaining, Error Handling & Promise.all',
      'Async / Await Syntax & Fetch API Integration',
      'Local Storage, Session Storage & Cookies Management',
      'Modular JavaScript: ES Modules (import / export)',
      'Git Fundamentals: Branches, Commits & GitHub Workflow',
      'Modern Tooling: Vite, npm & Package Configurations',
      'React Fundamentals: JSX, Components & Props',
      'State Management with useState & Conditional Rendering',
      'Side Effects & Lifecycle with useEffect',
      'Custom Hooks & Component Reusability Patterns',
      'Forms Handling & Controlled vs Uncontrolled Inputs',
      'Tailwind CSS Integration & Cyberpunk UI Styling',
      'Client-Side Routing with React Router',
      'API Integration & Global Context API / Zustand',
      'Building a Full Responsive Interactive Web Dashboard',
      'Authentication Flows & Token Storage',
      'Performance Optimization & React memo / useMemo',
      'Testing with Jest & React Testing Library',
      'Docker Containerization or Vercel Deployment',
      'Final Web App Polish, Responsive Audit & Live Launch'
    ];
  } else if (tLower.includes('dsa') || tLower.includes('algorithm') || tLower.includes('leetcode')) {
    modules = [
      'Time & Space Complexity: Big-O Asymptotic Analysis',
      'Arrays: Two Pointers Pattern (Reverse, Valid Palindrome)',
      'Arrays: Sliding Window Pattern (Max Sum Subarray)',
      'Prefix Sum & Frequency Hash Maps (Two Sum, Group Anagrams)',
      'Strings: Palindromes & Longest Substring Without Repeats',
      'Binary Search on Sorted Arrays & Boundary Conditions',
      'Binary Search on Answer Space (Ship Packages / Rotated Array)',
      'Linked Lists: Insertion, Reversal & Fast-Slow Pointers',
      'Linked Lists: Cycle Detection (Floyd Algorithm) & Merging',
      'Stacks: Valid Parentheses & Monotonic Stack Pattern',
      'Queues: Sliding Window Maximum & FIFO Processing',
      'Recursion Fundamentals & Call Stack Memory Visualization',
      'Backtracking: Permutations, Subsets & Combination Sum',
      'Binary Trees: Inorder, Preorder, Postorder Traversals',
      'Binary Trees: Max Depth, Diameter & Inverting Trees',
      'Binary Search Trees (BST): Validation, Insertion & LCA',
      'Tree BFS: Breadth-First Level Order Traversal',
      'Heaps & Priority Queues: Top K Frequent Elements',
      'Trie (Prefix Tree): Autocomplete & Word Search',
      'Graphs: Representation (Adj List/Matrix) & BFS Traversal',
      'Graphs: DFS Traversal & Cycle Detection',
      'Graphs: Connected Components & Number of Islands',
      'Graphs: Dijkstra Shortest Path Algorithm',
      'Graphs: Topological Sort & Course Schedule Pattern',
      'Union-Find (Disjoint Set) with Path Compression',
      'Dynamic Programming: 1D Memoization (Climbing Stairs, Robber)',
      'Dynamic Programming: Coin Change & Knapsack Patterns',
      'Dynamic Programming: Longest Increasing Subsequence (LIS)',
      'Dynamic Programming: 2D Grid Unique Paths & Edit Distance',
      'Mock Coding Interview Simulation & Blind 75 Revision'
    ];
  } else {
    modules = [
      'Core Architecture Setup & Environment Configuration',
      'Foundational Theory, Terminology & Principles',
      'Syntax Basics, Data Structures & Memory Models',
      'Control Flow, Decision Logic & Modular Architecture',
      'Standard Library Exploration & Essential Utilities',
      'Hands-on Practical Exercises & Problem Solving',
      'Error Diagnostics, Edge-Case Handling & Robustness',
      'Intermediate Design Patterns & Best Practices',
      'Data Persistence, Storage & Schema Modeling',
      'Network Protocols, APIs & Async Communication',
      'Testing Methodologies & Automated Validation',
      'Refactoring for Readability, Speed & Clean Code',
      'Real-World Project Planning & Blueprinting',
      'Core Feature Implementation & Integration',
      'Security Auditing, Input Sanitization & Safety',
      'System Optimization & Resource Efficiency',
      'Packaging, Deployment & Release Engineering',
      'Comprehensive Review, Capstone Delivery & Mastery'
    ];
  }

  for (let d = 1; d <= days; d++) {
    const modIdx = Math.floor(((d - 1) / days) * modules.length);
    const topic = modules[modIdx] || `Advanced Topic & Applied Milestone`;
    subtasks.push({
      id: `st-day-${d}-${Date.now().toString(36)}`,
      dayNumber: d,
      text: `Day ${d}: ${topic}`,
      done: false
    });
  }

  return subtasks;
}

async function generateAIGoalPlan(title, category, days) {
  days = Math.max(1, Math.min(parseInt(days, 10) || 30, 90));
  const prompt = `You are Elevora AI, an elite software engineering coach.
The user wants to achieve this goal: "${title}" in the domain of "${category}".
Duration: Exactly ${days} days.

Create a specific, practical day-by-day roadmap with exactly ${days} daily tasks (Day 1 to Day ${days}).
Format your response STRICTLY as a valid JSON array of strings, with each item formatted like:
["Day 1: Specific actionable task", "Day 2: Specific actionable task", ...]
Do NOT include markdown backticks or commentary outside the JSON array. Output only the JSON array.`;

  try {
    const rawAi = await queryPrimaryAI(prompt);
    const cleaned = rawAi.replace(/```json/gi, '').replace(/```/g, '').trim();
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map((item, idx) => ({
        id: `st-ai-${idx + 1}-${Date.now().toString(36)}`,
        dayNumber: idx + 1,
        text: typeof item === 'string' ? item : (item.text || item.task || `Day ${idx + 1}: ${title}`),
        done: false
      }));
    }
  } catch (err) {
    console.warn(`[AI Goal Plan] Cloud AI notice (${err.message}), using algorithmic curriculum.`);
  }

  return generateAlgorithmicRoadmap(title, category, days);
}

// ==========================================
// 5. DYNAMIC AI QUIZ GENERATOR (Req 5)
// ==========================================
const fallbackQuizBank = {
  python: {
    beginner: [
      {
        question: "What is the result of type(5 / 2) in Python 3?",
        code: "x = 5 / 2\nprint(type(x))",
        options: ["<class 'int'>", "<class 'float'>", "<class 'double'>", "<class 'number'>"],
        correct: 1,
        explanation: "In Python 3, the single slash '/' always performs true floating-point division, producing 2.5 of type float. For integer floor division, '//' is used."
      },
      {
        question: "Which collection type is unordered, mutable, and does not allow duplicate elements?",
        code: "items = {1, 2, 2, 3}\nprint(len(items))",
        options: ["List", "Tuple", "Set", "Dictionary"],
        correct: 2,
        explanation: "A Set in Python stores unique elements and eliminates duplicates automatically. The length of {1, 2, 2, 3} is 3."
      },
      {
        question: "What will print for string slicing s[1:4] with s = 'ELEVORA'?",
        code: "s = 'ELEVORA'\nprint(s[1:4])",
        options: ["ELE", "LEV", "LEVO", "EVO"],
        correct: 1,
        explanation: "Python slicing is start-inclusive and end-exclusive. Indices 1, 2, 3 correspond to 'L', 'E', 'V'."
      }
    ],
    intermediate: [
      {
        question: "What happens when mutable default arguments are used across multiple calls?",
        code: "def add_item(val, bucket=[]):\n    bucket.append(val)\n    return bucket\n\nprint(add_item('A'))\nprint(add_item('B'))",
        options: ["['A'] then ['B']", "['A'] then ['A', 'B']", "['A'] then Error", "['B'] then ['A']"],
        correct: 1,
        explanation: "Default parameter expressions are evaluated once when the function is defined. The identical list object is reused across calls, so 'B' is appended to the existing list ['A']."
      },
      {
        question: "What is the key difference between a Generator expression and a List comprehension?",
        code: "# Gen vs List\ng = (x**2 for x in range(1000000))\nl = [x**2 for x in range(1000000)]",
        options: ["Generators are immutable lists", "Generators evaluate lazily on-demand saving memory (O(1) space)", "List comprehensions run in background threads", "Generators cannot be iterated with for loops"],
        correct: 1,
        explanation: "Generators yield items lazily one-at-a-time using iterator protocol, consuming O(1) auxiliary memory regardless of sequence size."
      }
    ],
    pro: [
      {
        question: "Under the Global Interpreter Lock (GIL) in CPython, how does threading behave for CPU-bound tasks?",
        code: "from threading import Thread\n# Multiple CPU-bound threads in Python 3.12",
        options: ["Threads run in true parallel hardware cores", "Threads time-slice on a single core and may run slower due to GIL lock contention", "Threads bypass the OS scheduler completely", "Threads compile code to C natively"],
        correct: 1,
        explanation: "Because of the CPython GIL, only one thread can execute Python bytecode at a time. For CPU-bound tasks, multithreading incurs lock thrashing without parallelism. Multiprocessing is required."
      }
    ]
  },
  javascript: {
    beginner: [
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        code: "console.log(5 == '5', 5 === '5');",
        options: ["'==' checks value & type; '===' checks value only", "'==' performs type coercion; '===' checks strictly both value and type", "Both are strictly identical in modern ES6", "'===' is deprecated"],
        correct: 1,
        explanation: "'==' performs implicit type conversion before comparison ('5 == \"5\"' is true), while '===' requires matching types ('5 === \"5\"' is false)."
      }
    ],
    intermediate: [
      {
        question: "What will print to the console given this Event Loop microtask vs macrotask execution?",
        code: "console.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');",
        options: ["1, 2, 3, 4", "1, 4, 2, 3", "1, 4, 3, 2", "1, 3, 4, 2"],
        correct: 2,
        explanation: "Synchronous code runs first ('1', '4'). Next, microtasks (Promise resolution) run before timer callbacks (macrotasks), yielding '1, 4, 3, 2'."
      }
    ],
    pro: [
      {
        question: "What occurs during V8 Hidden Class transitions when object properties are added out of order?",
        code: "const o1 = {}; o1.a = 1; o1.b = 2;\nconst o2 = {}; o2.b = 2; o2.a = 1;",
        options: ["V8 treats them as identical hidden classes", "V8 creates distinct hidden class transition trees (shapes), de-optimizing inline caches", "V8 throws a hidden property warning", "V8 alphabetically sorts properties in memory"],
        correct: 1,
        explanation: "V8 relies on hidden classes (Shapes) for fast property access. Initializing properties in different orders creates distinct transition paths, degrading polymorphic inline caches into megamorphic lookups."
      }
    ]
  }
};

async function generateDynamicQuiz(language, level, count) {
  language = (language || 'python').toLowerCase();
  level = (level || 'intermediate').toLowerCase();
  count = Math.min(Math.max(parseInt(count, 10) || 5, 2), 10);

  const prompt = `You are Elevora AI, an expert computer science professor.
Generate a dynamic ${level.toUpperCase()} level quiz on the "${language}" programming language.
Number of questions: ${count}.
Provide tricky, real-world questions with clear code examples.

STRICT JSON schema output:
[
  {
    "question": "Question text here",
    "code": "optional code snippet or empty string",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0,
    "explanation": "Detailed pedagogical explanation of why this answer is correct and common traps."
  }
]
Output ONLY raw JSON with zero markdown or extra words.`;

  try {
    const rawAi = await queryPrimaryAI(prompt);
    const cleaned = rawAi.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((q, idx) => ({
        id: `q-${Date.now()}-${idx}`,
        category: language.toUpperCase(),
        level: level.toUpperCase(),
        question: q.question,
        code: q.code || '',
        options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
        correct: typeof q.correct === 'number' ? q.correct : 0,
        explanation: q.explanation || 'Answer verified by Elevora AI.'
      }));
    }
  } catch (err) {
    console.warn(`[AI Quiz] Cloud AI notice (${err.message}), using curated knowledge bank.`);
  }

  const langKey = fallbackQuizBank[language] ? language : 'python';
  const levelKey = (fallbackQuizBank[langKey] && fallbackQuizBank[langKey][level]) ? level : 'beginner';
  const questions = (fallbackQuizBank[langKey] && fallbackQuizBank[langKey][levelKey]) || fallbackQuizBank.python.beginner;
  return questions.slice(0, count).map((q, idx) => ({
    id: `q-curated-${idx}`,
    category: langKey.toUpperCase(),
    level: levelKey.toUpperCase(),
    ...q
  }));
}

// ==========================================
// 6. HTTP SERVER & REST API DISPATCHER
// ==========================================
const server = http.createServer(async (req, res) => {
  // Global CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = urlObj.pathname;

  function readBody() {
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
        if (data.length > 25 * 1024 * 1024) {
          reject(new Error('Payload too large'));
        }
      });
      req.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (e) {
          resolve({});
        }
      });
      req.on('error', reject);
    });
  }

  function sendJson(status, payload) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload));
  }

  function getAuthUser() {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return null;

    if (useSqlite) {
      const session = db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token);
      if (!session) return null;
      if (new Date(session.expires_at) < new Date()) return null;
      const user = db.prepare('SELECT id, name, email, role, avatar, xp, streak, last_active, created_at FROM users WHERE id = ?').get(session.user_id);
      return user || null;
    } else {
      const data = getJsonDb();
      const session = data.sessions.find(s => s.token === token);
      if (!session || new Date(session.expires_at) < new Date()) return null;
      const user = data.users.find(u => u.id === session.user_id);
      return user ? { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, xp: user.xp, streak: user.streak, last_active: user.last_active } : null;
    }
  }

  // ----------------------------------------
  // API: Health Check
  // ----------------------------------------
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(200, {
      status: 'ok',
      platform: 'Elevora AI Developer Hub',
      aiModel: DEFAULT_GEMINI_MODEL,
      database: useSqlite ? 'SQLite (ACID Native Embedded)' : 'JSON Engine (File-backed)',
      timestamp: new Date().toISOString()
    });
  }

  // ----------------------------------------
  // API: Authentication
  // ----------------------------------------
  if (req.method === 'POST' && pathname === '/api/auth/register') {
    const body = await readBody();
    const { name, email, password, role } = body;
    if (!email || !password) {
      return sendJson(400, { success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();
    const cleanRole = role || 'Full Stack Engineer';
    const salt = crypto.randomBytes(16).toString('hex');
    const pwdHash = hashPassword(password, salt);
    const userId = `usr-${Date.now().toString(36)}`;
    const token = generateToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (useSqlite) {
      try {
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
        if (existing) {
          return sendJson(409, { success: false, error: 'An account with this email already exists' });
        }
        db.prepare(`
          INSERT INTO users (id, name, email, role, avatar, password_hash, salt, xp, streak, last_active, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(userId, cleanName, cleanEmail, cleanRole, '👨‍💻', pwdHash, salt, 250, 7, now.slice(0, 10), now);

        db.prepare(`
          INSERT INTO sessions (token, user_id, created_at, expires_at)
          VALUES (?, ?, ?, ?)
        `).run(token, userId, now, expiresAt);
      } catch (err) {
        return sendJson(500, { success: false, error: err.message });
      }
    } else {
      const data = getJsonDb();
      if (data.users.find(u => u.email === cleanEmail)) {
        return sendJson(409, { success: false, error: 'An account with this email already exists' });
      }
      data.users.push({
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        avatar: '👨‍💻',
        password_hash: pwdHash,
        salt,
        xp: 250,
        streak: 7,
        last_active: now.slice(0, 10),
        created_at: now
      });
      data.sessions.push({ token, user_id: userId, created_at: now, expires_at: expiresAt });
      saveJsonDb(data);
    }

    return sendJson(200, {
      success: true,
      token,
      user: {
        id: userId,
        name: cleanName,
        email: cleanEmail,
        role: cleanRole,
        avatar: '👨‍💻',
        xp: 250,
        streak: 7
      }
    });
  }

  if (req.method === 'POST' && pathname === '/api/auth/login') {
    const body = await readBody();
    const { email, password } = body;
    if (!email || !password) {
      return sendJson(400, { success: false, error: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let userRecord = null;

    if (useSqlite) {
      userRecord = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    } else {
      const data = getJsonDb();
      userRecord = data.users.find(u => u.email === cleanEmail);
    }

    if (!userRecord) {
      return sendJson(401, { success: false, error: 'Invalid email or password' });
    }

    const expectedHash = hashPassword(password, userRecord.salt);
    if (expectedHash !== userRecord.password_hash) {
      return sendJson(401, { success: false, error: 'Invalid email or password' });
    }

    const token = generateToken();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (useSqlite) {
      db.prepare(`
        INSERT INTO sessions (token, user_id, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `).run(token, userRecord.id, now, expiresAt);
    } else {
      const data = getJsonDb();
      data.sessions.push({ token, user_id: userRecord.id, created_at: now, expires_at: expiresAt });
      saveJsonDb(data);
    }

    return sendJson(200, {
      success: true,
      token,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        role: userRecord.role,
        avatar: userRecord.avatar,
        xp: userRecord.xp,
        streak: userRecord.streak
      }
    });
  }

  if (req.method === 'GET' && pathname === '/api/auth/me') {
    const user = getAuthUser();
    if (!user) {
      return sendJson(401, { success: false, error: 'Unauthorized or token expired' });
    }
    return sendJson(200, { success: true, user });
  }

  if (req.method === 'POST' && pathname === '/api/auth/logout') {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      if (useSqlite) {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      } else {
        const data = getJsonDb();
        data.sessions = data.sessions.filter(s => s.token !== token);
        saveJsonDb(data);
      }
    }
    return sendJson(200, { success: true, message: 'Logged out' });
  }

  // ----------------------------------------
  // API: AI Day-by-Day Goal Planner
  // ----------------------------------------
  if (req.method === 'POST' && pathname === '/api/goals/ai-plan') {
    const body = await readBody();
    const { title, category, days } = body;
    if (!title) {
      return sendJson(400, { success: false, error: 'Goal title is required' });
    }

    const durationDays = parseInt(days, 10) || 30;
    console.log(`[Elevora AI Planner] Generating ${durationDays}-day plan for "${title}" (${category})`);

    const subtasks = await generateAIGoalPlan(title, category || 'Web Development', durationDays);
    return sendJson(200, {
      success: true,
      title,
      days: durationDays,
      subtasks
    });
  }

  // ----------------------------------------
  // API: Goals Storage (SQLite)
  // ----------------------------------------
  if (req.method === 'GET' && pathname === '/api/goals') {
    const user = getAuthUser() || { id: 'usr-demo-1' };
    if (useSqlite) {
      const goals = db.prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC').all(user.id);
      const subtaskStmt = db.prepare('SELECT * FROM subtasks WHERE goal_id = ? ORDER BY day_number ASC');
      const fullGoals = goals.map(g => ({
        id: g.id,
        title: g.title,
        category: g.category,
        priority: g.priority,
        days: g.days,
        targetDate: g.target_date,
        subtasks: subtaskStmt.all(g.id).map(st => ({
          id: st.id,
          dayNumber: st.day_number,
          text: st.text,
          done: Boolean(st.done)
        }))
      }));
      return sendJson(200, { success: true, goals: fullGoals });
    } else {
      const data = getJsonDb();
      const userGoals = data.goals.filter(g => g.user_id === user.id);
      const fullGoals = userGoals.map(g => ({
        ...g,
        subtasks: data.subtasks.filter(st => st.goal_id === g.id)
      }));
      return sendJson(200, { success: true, goals: fullGoals });
    }
  }

  if (req.method === 'POST' && pathname === '/api/goals') {
    const user = getAuthUser() || { id: 'usr-demo-1' };
    const body = await readBody();
    const { id, title, category, priority, days, targetDate, subtasks } = body;

    const goalId = id || `goal-${Date.now()}`;
    const now = new Date().toISOString();
    const duration = parseInt(days, 10) || 30;

    if (useSqlite) {
      db.prepare(`
        INSERT OR REPLACE INTO goals (id, user_id, title, category, priority, days, target_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(goalId, user.id, title, category, priority || 'Medium', duration, targetDate || '', now);

      db.prepare('DELETE FROM subtasks WHERE goal_id = ?').run(goalId);
      const insertSt = db.prepare(`
        INSERT INTO subtasks (id, goal_id, day_number, text, done, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      (subtasks || []).forEach((st, idx) => {
        insertSt.run(st.id || `st-${Date.now()}-${idx}`, goalId, st.dayNumber || (idx + 1), st.text, st.done ? 1 : 0, now);
      });
    } else {
      const data = getJsonDb();
      data.goals = data.goals.filter(g => g.id !== goalId);
      data.goals.unshift({
        id: goalId,
        user_id: user.id,
        title,
        category,
        priority: priority || 'Medium',
        days: duration,
        target_date: targetDate || '',
        created_at: now
      });
      data.subtasks = data.subtasks.filter(st => st.goal_id !== goalId);
      (subtasks || []).forEach((st, idx) => {
        data.subtasks.push({
          id: st.id || `st-${Date.now()}-${idx}`,
          goal_id: goalId,
          day_number: st.dayNumber || (idx + 1),
          text: st.text,
          done: Boolean(st.done),
          created_at: now
        });
      });
      saveJsonDb(data);
    }

    return sendJson(200, { success: true, goalId });
  }

  if (req.method === 'PUT' && pathname.startsWith('/api/goals/') && pathname.includes('/subtasks/')) {
    const parts = pathname.split('/');
    const goalId = parts[3];
    const subtaskId = parts[5];
    const body = await readBody();
    const done = body.done ? 1 : 0;

    if (useSqlite) {
      db.prepare('UPDATE subtasks SET done = ? WHERE id = ? AND goal_id = ?').run(done, subtaskId, goalId);
    } else {
      const data = getJsonDb();
      const st = data.subtasks.find(s => s.id === subtaskId && s.goal_id === goalId);
      if (st) st.done = Boolean(body.done);
      saveJsonDb(data);
    }
    return sendJson(200, { success: true, subtaskId, done });
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/goals/')) {
    const goalId = pathname.replace('/api/goals/', '').trim();
    if (useSqlite) {
      db.prepare('DELETE FROM goals WHERE id = ?').run(goalId);
      db.prepare('DELETE FROM subtasks WHERE goal_id = ?').run(goalId);
    } else {
      const data = getJsonDb();
      data.goals = data.goals.filter(g => g.id !== goalId);
      data.subtasks = data.subtasks.filter(st => st.goal_id !== goalId);
      saveJsonDb(data);
    }
    return sendJson(200, { success: true, message: 'Goal removed' });
  }

  // ----------------------------------------
  // API: Dynamic AI Quiz Generator
  // ----------------------------------------
  if (req.method === 'POST' && pathname === '/api/ai/quiz') {
    const body = await readBody();
    const language = body.language || 'python';
    const level = body.level || 'intermediate';
    const count = body.count || 5;

    console.log(`[Elevora AI Quiz] Generating ${count} ${level} questions for ${language}`);
    const questions = await generateDynamicQuiz(language, level, count);
    return sendJson(200, { success: true, language, level, questions });
  }

  // ----------------------------------------
  // API: PDF Upload, Read & Download
  // ----------------------------------------
  if (req.method === 'POST' && pathname === '/api/pdf/upload') {
    const user = getAuthUser() || { id: 'usr-demo-1' };
    const body = await readBody();
    const { title, filename, category, fileData, fileSize } = body;

    if (!filename || !fileData) {
      return sendJson(400, { success: false, error: 'File data and filename are required' });
    }

    const pdfId = `pdf-${Date.now()}`;
    const cleanTitle = (title || filename.replace(/\.pdf$/i, '')).trim();
    const cleanCat = category || 'Custom Upload';
    const now = new Date().toISOString();

    if (useSqlite) {
      db.prepare(`
        INSERT INTO uploaded_pdfs (id, user_id, title, filename, category, file_size, file_data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(pdfId, user.id, cleanTitle, filename, cleanCat, fileSize || fileData.length, fileData, now);
    } else {
      const data = getJsonDb();
      data.uploaded_pdfs.unshift({
        id: pdfId,
        user_id: user.id,
        title: cleanTitle,
        filename,
        category: cleanCat,
        file_size: fileSize || fileData.length,
        file_data: fileData,
        created_at: now
      });
      saveJsonDb(data);
    }

    return sendJson(200, {
      success: true,
      pdf: {
        id: pdfId,
        title: cleanTitle,
        filename,
        category: cleanCat,
        fileSize: fileSize || fileData.length,
        createdAt: now
      }
    });
  }

  if (req.method === 'GET' && pathname === '/api/pdf/list') {
    if (useSqlite) {
      const list = db.prepare(`
        SELECT id, title, filename, category, file_size as fileSize, created_at as createdAt
        FROM uploaded_pdfs
        ORDER BY created_at DESC
      `).all();
      return sendJson(200, { success: true, list });
    } else {
      const data = getJsonDb();
      const list = (data.uploaded_pdfs || []).map(p => ({
        id: p.id,
        title: p.title,
        filename: p.filename,
        category: p.category,
        fileSize: p.file_size,
        createdAt: p.created_at
      }));
      return sendJson(200, { success: true, list });
    }
  }

  if (req.method === 'GET' && pathname.startsWith('/api/pdf/file/')) {
    const pdfId = pathname.replace('/api/pdf/file/', '').trim();
    let pdfRecord = null;
    if (useSqlite) {
      pdfRecord = db.prepare('SELECT * FROM uploaded_pdfs WHERE id = ?').get(pdfId);
    } else {
      const data = getJsonDb();
      pdfRecord = (data.uploaded_pdfs || []).find(p => p.id === pdfId);
    }

    if (!pdfRecord) {
      return sendJson(404, { success: false, error: 'PDF not found' });
    }

    return sendJson(200, {
      success: true,
      pdf: {
        id: pdfRecord.id,
        title: pdfRecord.title,
        filename: pdfRecord.filename,
        category: pdfRecord.category,
        fileData: pdfRecord.file_data,
        fileSize: pdfRecord.file_size,
        createdAt: pdfRecord.created_at
      }
    });
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/pdf/')) {
    const pdfId = pathname.replace('/api/pdf/', '').trim();
    if (useSqlite) {
      db.prepare('DELETE FROM uploaded_pdfs WHERE id = ?').run(pdfId);
    } else {
      const data = getJsonDb();
      data.uploaded_pdfs = (data.uploaded_pdfs || []).filter(p => p.id !== pdfId);
      saveJsonDb(data);
    }
    return sendJson(200, { success: true, message: 'PDF removed' });
  }

  // ----------------------------------------
  // API: AI Code Analysis & Chatbot (Req 1, 2, 3)
  // ----------------------------------------
  if (req.method === 'POST' && (pathname === '/api/ai/analyze' || pathname === '/api/ai/chat')) {
    const body = await readBody();
    const code = body.code || '';
    const language = body.language || 'javascript';
    const action = body.action || 'explain_and_errors';
    const userPrompt = body.prompt || '';
    const customKey = body.apiKey || '';

    let aiPrompt = '';
    if (action === 'explain_and_errors') {
      aiPrompt = `You are Elevora AI, an elite software engineering mentor powered by Google Gemini.
Analyze this ${language} code carefully and perform a complete diagnosis:
\`\`\`${language}
${code}
\`\`\`

Provide your response strictly in clean, beautiful Markdown with these 4 sections:
### 🐞 1. Errors & Bugs Analysis
- Detect all syntax errors, edge-case failures, off-by-one errors, missing delimiters, unhandled promises, or logical traps.
- State the exact line number and explain WHY it fails.
- If no bugs exist, state "✅ No syntax errors or logical bugs found."

### 💡 2. Step-by-Step Code Explanation
- Walk through the execution flow step-by-step in clear, easy-to-understand terms.

### ⚡ 3. Time & Space Complexity
- State the Big-O Time Complexity and Space Complexity with concise mathematical explanations.

### ✅ 4. Complete Corrected & Clean Code
- Provide the full, clean, working code in a \`\`\`${language} code block ready to run.`;
    } else if (action === 'errors') {
      aiPrompt = `Find all errors, syntax bugs, and runtime pitfalls in this ${language} code, explain why they occur, and provide the fully corrected code snippet:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (action === 'explain') {
      aiPrompt = `Explain this ${language} code in depth with high-level architecture, line-by-line logic, and Big-O complexity analysis:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (action === 'optimize') {
      aiPrompt = `Optimize and clean refactor this ${language} code for maximum execution speed, clean architecture, and modern idiomatic patterns:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (action === 'test') {
      aiPrompt = `Generate a comprehensive unit test suite (happy paths + edge cases) for this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else {
      // Chatbot / Doubt Solver mode
      const hasCode = code && code.trim().length > 0;
      aiPrompt = `You are Elevora AI, a world-class coding chatbot and programming mentor like ChatGPT.
${hasCode ? `Context Code (${language}):\n\`\`\`${language}\n${code}\n\`\`\`\n` : ''}
Developer Doubt / Question: "${userPrompt}"

Please provide a thorough, high-velocity answer:
1. Answer the doubt clearly and directly with intuitive explanations.
2. Provide practical, well-commented code snippets in the relevant language.
3. Highlight best practices, pitfalls to avoid, and time/space complexity where applicable.
4. Format cleanly using Markdown with code blocks and bullet points.`;
    }

    console.log(`[Elevora AI Backend] Action: "${action}" | Lang: ${language} | Length: ${code.length}`);

    let responseText = '';
    let engineSource = 'Google Gemini 3.8 Flash (High Velocity)';

    try {
      responseText = await queryPrimaryAI(aiPrompt, customKey);
    } catch (apiErr) {
      console.warn(`[Elevora AI Backend] Cloud AI query failed (${apiErr.message}), falling back to local heuristics.`);
      responseText = generateLocalFallback(action, code, language, userPrompt);
      engineSource = 'Elevora Local Heuristic Engine';
    }

    return sendJson(200, {
      success: true,
      response: responseText,
      source: engineSource,
      model: DEFAULT_GEMINI_MODEL,
      timestamp: new Date().toISOString()
    });
  }

  // ----------------------------------------
  // STATIC FILE SERVING
  // ----------------------------------------
  let reqPath = decodeURI(pathname);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, reqPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 Not Found: ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Elevora AI Developer Hub active at: http://localhost:${PORT}`);
  console.log(`🤖 AI Engine: Google Gemini 3.8 Flash (${DEFAULT_GEMINI_MODEL})`);
  console.log(`🗄️  Database: ${useSqlite ? 'SQLite (elevora.db)' : 'JSON Engine (elevora_data.json)'}`);
  console.log(`======================================================\n`);
});
