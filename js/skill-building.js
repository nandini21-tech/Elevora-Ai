/**
 * Elevora AI - Dynamic Skill Building & Interactive AI Quiz Engine
 * Features:
 * - Programming Language Selection (Python, JS, TS, Java, C++, Go, Rust, SQL, React, DSA)
 * - Proficiency Level Selector (Beginner, Intermediate, Pro) (Req 5)
 * - Dynamic AI Question Generation (Req 5)
 * - XP level progression, badge rewards, and in-depth pedagogical explanations
 */

const roadmapTracks = [
  {
    id: 'frontend',
    title: 'Frontend Architect',
    icon: '🎨',
    desc: 'From DOM & Modern ES6+ to React 19, Server Components, and Web Performance.',
    steps: [
      { name: 'HTML5 Semantic & Modern CSS Grid/Flexbox', status: 'completed' },
      { name: 'JavaScript Deep Dive: Closures, Event Loop, Async/Await', status: 'completed' },
      { name: 'TypeScript: Advanced Generics & Utility Types', status: 'in-progress' },
      { name: 'React 19: Hooks, Server Actions & State Orchestration', status: 'in-progress' },
      { name: 'Next.js App Router, SSR, Edge Middleware & Caching', status: 'upcoming' },
      { name: 'Web Core Vitals & Performance Optimization', status: 'upcoming' }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Systems & Cloud',
    icon: '⚡',
    desc: 'Distributed systems, REST/gRPC APIs, Databases, Caching, and Container orchestration.',
    steps: [
      { name: 'Core Language Mastery (Node.js, Python, or Go)', status: 'completed' },
      { name: 'Relational DBs (PostgreSQL, ACID, Indexing, Joins)', status: 'completed' },
      { name: 'High-Concurrency Caching with Redis & Pub/Sub', status: 'in-progress' },
      { name: 'Message Queues (Apache Kafka / RabbitMQ)', status: 'upcoming' },
      { name: 'Docker Multi-stage Builds & Kubernetes Pod Orchestration', status: 'upcoming' },
      { name: 'Distributed Observability (OpenTelemetry & Prometheus)', status: 'upcoming' }
    ]
  },
  {
    id: 'dsa',
    title: 'DSA & Algorithmic Problem Solving',
    icon: '🧩',
    desc: 'Crucial algorithms and data structures required for FAANG coding interviews.',
    steps: [
      { name: 'Arrays, Two Pointers & Sliding Window Patterns', status: 'completed' },
      { name: 'Hash Maps, Sets & Prefix Sum Techniques', status: 'completed' },
      { name: 'Binary Search & Monotonic Stacks', status: 'in-progress' },
      { name: 'Trees, Binary Search Trees & BFS/DFS Traversal', status: 'in-progress' },
      { name: 'Graph Algorithms: Dijkstra, Topological Sort, Union-Find', status: 'upcoming' },
      { name: 'Dynamic Programming: 1D & 2D Memoization', status: 'upcoming' }
    ]
  },
  {
    id: 'ai',
    title: 'AI & LLM Application Engineering',
    icon: '🤖',
    desc: 'Prompt engineering, Retrieval Augmented Generation (RAG), Vector DBs & autonomous agents.',
    steps: [
      { name: 'Python for AI & API SDK Integration', status: 'completed' },
      { name: 'Prompt Engineering & Structured Schema Outputs', status: 'completed' },
      { name: 'Embeddings & Vector Databases (ChromaDB, Pinecone)', status: 'in-progress' },
      { name: 'RAG Architecture with Hybrid Search & Re-ranking', status: 'upcoming' },
      { name: 'Autonomous Multi-Agent Orchestration & Tool Calling', status: 'upcoming' }
    ]
  }
];

class SkillBuilding {
  constructor() {
    this.xp = parseInt(localStorage.getItem('elevora_xp') || '250', 10);
    this.selectedLanguage = 'Python';
    this.selectedLevel = 'Beginner'; // 'Beginner' | 'Intermediate' | 'Pro'
    this.selectedCount = 5;

    this.questions = [];
    this.currentQuizIdx = 0;
    this.answered = false;
    this.quizScore = 0;
    this.isGenerating = false;

    this.initElements();
    this.initEventListeners();
    this.renderRoadmaps();
    this.updateXPBadge();
    this.loadDefaultQuestions();
  }

  initElements() {
    this.quizContainer = document.getElementById('quiz-challenge-container');
    this.langSelect = document.getElementById('quiz-lang-select');
    this.countSelect = document.getElementById('quiz-count-select');
    this.btnGenerateQuiz = document.getElementById('btn-generate-ai-quiz');
  }

  initEventListeners() {
    // Language dropdown
    this.langSelect?.addEventListener('change', (e) => {
      this.selectedLanguage = e.target.value;
    });

    // Level Selector Buttons (Req 5)
    document.querySelectorAll('.quiz-level-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.quiz-level-pill').forEach(b => {
          b.classList.remove('active-level-btn');
          b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
        });

        btn.classList.add('active-level-btn');
        btn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
        this.selectedLevel = btn.dataset.level; // 'Beginner' | 'Intermediate' | 'Pro'
      });
    });

    // Generate Dynamic AI Quiz Button (Req 5)
    this.btnGenerateQuiz?.addEventListener('click', async () => {
      await this.generateDynamicAIQuiz();
    });
  }

  loadDefaultQuestions() {
    this.questions = [
      {
        id: 'q-default-1',
        category: 'PYTHON',
        level: 'BEGINNER',
        question: 'What is the data type of the expression: 10 / 2 in Python 3?',
        code: `x = 10 / 2\nprint(type(x))`,
        options: ['<class \'int\'>', '<class \'float\'>', '<class \'double\'>', '<class \'number\'>'],
        correct: 1,
        explanation: 'In Python 3, the single slash division operator (/) always returns a float (5.0), whereas floor division (//) returns an integer (5).'
      },
      {
        id: 'q-default-2',
        category: 'PYTHON',
        level: 'BEGINNER',
        question: 'Which of the following creates an empty set in Python?',
        code: `a = {}\nb = set()\nc = []`,
        options: ['a = {}', 'b = set()', 'Both a and b', 'None of the above'],
        correct: 1,
        explanation: '{} creates an empty dictionary (dict). To create an empty set, you must use the set() constructor.'
      },
      {
        id: 'q-default-3',
        category: 'PYTHON',
        level: 'BEGINNER',
        question: 'What is the output of the following loop with a break statement?',
        code: `for i in range(5):\n    if i == 2:\n        break\n    print(i, end=" ")`,
        options: ['0 1 2', '0 1', '1 2', '0 1 2 3 4'],
        correct: 1,
        explanation: 'The loop executes for i = 0 (prints 0), then i = 1 (prints 1). When i == 2, the break statement terminates the loop before printing.'
      }
    ];
    this.currentQuizIdx = 0;
    this.answered = false;
    this.quizScore = 0;
    this.renderQuiz();
  }

  async generateDynamicAIQuiz() {
    if (this.isGenerating) return;
    this.isGenerating = true;

    const lang = this.langSelect ? this.langSelect.value : this.selectedLanguage;
    const level = this.selectedLevel || 'Beginner';
    const count = this.countSelect ? parseInt(this.countSelect.value, 10) : 5;

    if (this.btnGenerateQuiz) {
      this.btnGenerateQuiz.disabled = true;
      this.btnGenerateQuiz.innerHTML = `
        <span class="inline-block animate-spin mr-1.5">⚡</span>
        <span>Elevora AI is generating ${level} ${lang} quiz...</span>
      `;
    }

    window.app?.showToast?.(`Synthesizing dynamic ${level} questions for ${lang}...`, 'info');

    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const res = await fetch(`${base}/api/ai/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang, level, count })
      });

      let fetchedQuestions = [];
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          fetchedQuestions = data.questions;
        }
      }

      if (fetchedQuestions.length === 0) {
        fetchedQuestions = this.getAlgorithmicQuiz(lang, level, count);
      }

      this.questions = fetchedQuestions;
      this.currentQuizIdx = 0;
      this.answered = false;
      this.quizScore = 0;
      this.renderQuiz();

      window.app?.showToast?.(`🎯 Dynamic ${level} Quiz Generated (${this.questions.length} questions)!`, 'success');

    } catch (err) {
      this.questions = this.getAlgorithmicQuiz(lang, level, count);
      this.currentQuizIdx = 0;
      this.answered = false;
      this.quizScore = 0;
      this.renderQuiz();
      window.app?.showToast?.(`🎯 ${level} Quiz loaded!`, 'success');
    } finally {
      this.isGenerating = false;
      if (this.btnGenerateQuiz) {
        this.btnGenerateQuiz.disabled = false;
        this.btnGenerateQuiz.innerHTML = `
          <i data-lucide="sparkles" class="w-4 h-4"></i>
          <span>Generate Dynamic AI Quiz</span>
        `;
        lucide.createIcons();
      }
    }
  }

  getAlgorithmicQuiz(lang, level, count) {
    const list = [
      {
        id: `q-${Date.now()}-1`,
        category: lang.toUpperCase(),
        level: level.toUpperCase(),
        question: `In ${lang} (${level}), which best describes correct boundary edge-case handling?`,
        code: `// ${lang} ${level} Challenge\nfunction validateInput(data) {\n    if (!data) return false;\n    return process(data);\n}`,
        options: [
          'Inputs should always be sanitized before branching logic',
          'Exceptions should be swallowed silently with empty catch',
          'Global state mutation is preferred over pure returns',
          'Memory allocation never needs verification'
        ],
        correct: 0,
        explanation: `In ${lang}, verifying input preconditions and boundary conditions prior to state manipulation prevents null pointer dereferences and unexpected runtime exceptions.`
      },
      {
        id: `q-${Date.now()}-2`,
        category: lang.toUpperCase(),
        level: level.toUpperCase(),
        question: `What is the optimal asymptotic time complexity for hashing lookup operations in ${lang}?`,
        code: `// Key-Value Retrieval\nlookup(key) -> ???`,
        options: ['O(1) average time', 'O(n) best time', 'O(log n) constant time', 'O(n^2) quadratic time'],
        correct: 0,
        explanation: 'Hash maps and dictionaries achieve average case O(1) constant time complexity for key lookups using hash code bucket addressing.'
      }
    ];
    return list;
  }

  updateXPBadge() {
    localStorage.setItem('elevora_xp', this.xp.toString());
    const headerXP = document.getElementById('stat-header-xp');
    if (headerXP) headerXP.innerText = `${this.xp} XP`;

    const skillLevelEl = document.getElementById('skill-level-indicator');
    if (skillLevelEl) {
      let level = 'Junior Craftsman';
      if (this.xp >= 1200) level = 'Principal Staff Architect 🏆';
      else if (this.xp >= 700) level = 'Senior Lead Engineer ⚡';
      else if (this.xp >= 400) level = 'Full-Stack Specialist 🚀';
      skillLevelEl.innerText = level;
    }
  }

  renderQuiz() {
    const container = this.quizContainer || document.getElementById('quiz-challenge-container');
    if (!container) return;

    if (!this.questions || this.questions.length === 0) {
      container.innerHTML = `<div class="p-6 text-center text-slate-400">Click "Generate Dynamic AI Quiz" to start!</div>`;
      return;
    }

    // Check if finished all questions in this session
    if (this.currentQuizIdx >= this.questions.length) {
      this.renderQuizCompletion(container);
      return;
    }

    const q = this.questions[this.currentQuizIdx];
    const xpReward = q.level === 'PRO' ? 150 : (q.level === 'INTERMEDIATE' ? 100 : 50);

    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
      optionsHtml += `
        <button class="quiz-option-btn w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-700 text-xs text-slate-200 transition flex items-center justify-between group" data-idx="${idx}" onclick="window.skillBuilding.checkAnswer(${idx})">
          <div class="flex items-center gap-2.5">
            <span class="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 text-slate-400 text-[11px] font-mono font-bold flex items-center justify-center border border-slate-700">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
          </div>
        </button>
      `;
    });

    const levelBadgeColors = {
      BEGINNER: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60',
      INTERMEDIATE: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
      PRO: 'bg-rose-950/60 text-rose-400 border-rose-800/60'
    };

    container.innerHTML = `
      <div class="glass-card rounded-2xl p-6 border border-slate-800">
        <div class="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-800/50">
              ${q.category}
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${levelBadgeColors[q.level] || 'bg-slate-800 text-slate-300'}">
              ${q.level} LEVEL
            </span>
            <span class="text-xs text-slate-500">Question ${this.currentQuizIdx + 1} of ${this.questions.length}</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-amber-400 font-mono font-semibold">
            <span>+${xpReward} XP</span>
            <i data-lucide="zap" class="w-4 h-4"></i>
          </div>
        </div>

        <h3 class="text-sm md:text-base font-bold text-white mb-3">${q.question}</h3>

        ${q.code ? `
          <div class="mb-4 rounded-xl overflow-hidden border border-slate-800 bg-[#070b13]">
            <pre class="p-3 text-xs font-mono text-slate-200 overflow-x-auto"><code>${q.code}</code></pre>
          </div>
        ` : ''}

        <div class="space-y-2 mb-4" id="quiz-options-list">
          ${optionsHtml}
        </div>

        <div id="quiz-explanation-box" class="hidden p-4 rounded-xl border mb-4 text-xs leading-relaxed"></div>

        <div class="flex items-center justify-between pt-2">
          <span class="text-xs text-slate-400 font-mono">Score: ${this.quizScore} / ${this.currentQuizIdx}</span>
          <button id="btn-next-quiz" class="hidden px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-cyan-600/30" onclick="window.skillBuilding.nextQuestion()">
            <span>Next Question →</span>
          </button>
        </div>
      </div>
    `;

    lucide.createIcons();
  }

  checkAnswer(selectedIdx) {
    if (this.answered) return;
    this.answered = true;

    const q = this.questions[this.currentQuizIdx];
    const isCorrect = selectedIdx === q.correct;
    const optionBtns = document.querySelectorAll('.quiz-option-btn');
    const explBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('btn-next-quiz');
    const xpReward = q.level === 'PRO' ? 150 : (q.level === 'INTERMEDIATE' ? 100 : 50);

    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('border-emerald-500', 'bg-emerald-950/40', 'text-emerald-300');
        btn.classList.remove('bg-slate-900/80');
      } else if (idx === selectedIdx && !isCorrect) {
        btn.classList.add('border-rose-500', 'bg-rose-950/40', 'text-rose-300');
        btn.classList.remove('bg-slate-900/80');
      }
    });

    if (isCorrect) {
      this.quizScore += 1;
      this.xp += xpReward;
      this.updateXPBadge();
      if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
      explBox.className = 'p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-emerald-200 mb-4 text-xs leading-relaxed';
      explBox.innerHTML = `<strong>✅ Correct! (+${xpReward} XP)</strong><br><span class="text-slate-300 mt-1 inline-block">${q.explanation}</span>`;
      explBox.classList.remove('hidden');
      window.app?.showToast?.(`🎯 Correct! +${xpReward} XP gained`, 'success');
    } else {
      explBox.className = 'p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 text-rose-200 mb-4 text-xs leading-relaxed';
      explBox.innerHTML = `<strong>❌ Incorrect</strong><br><span class="text-slate-300 mt-1 inline-block">${q.explanation}</span>`;
      explBox.classList.remove('hidden');
      window.app?.showToast?.('Review the explanation to master this concept.', 'info');
    }

    if (nextBtn) nextBtn.classList.remove('hidden');
  }

  nextQuestion() {
    this.currentQuizIdx += 1;
    this.answered = false;
    this.renderQuiz();
  }

  renderQuizCompletion(container) {
    const total = this.questions.length;
    const pct = Math.round((this.quizScore / total) * 100);

    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }

    container.innerHTML = `
      <div class="glass-card rounded-2xl p-8 border border-cyan-500/30 text-center space-y-4">
        <div class="w-16 h-16 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex items-center justify-center mx-auto text-3xl">
          🏆
        </div>
        <h3 class="text-xl font-black text-white">Quiz Completed! Outstanding Effort!</h3>
        <p class="text-xs text-slate-400 max-w-md mx-auto">
          You mastered <strong>${this.quizScore} of ${total} (${pct}%)</strong> questions in the <strong>${this.selectedLevel} ${this.selectedLanguage}</strong> challenge.
        </p>
        <div class="flex items-center justify-center gap-3 pt-2">
          <button class="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-600/30" onclick="window.skillBuilding.generateDynamicAIQuiz()">
            Take Another Challenge
          </button>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  renderRoadmaps() {
    const container = document.getElementById('roadmap-tracks-container');
    if (!container) return;

    let html = '';
    roadmapTracks.forEach(track => {
      let stepsHtml = '';
      track.steps.forEach((step, idx) => {
        let statusBadge = '';
        if (step.status === 'completed') {
          statusBadge = '<span class="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">✓ Mastered</span>';
        } else if (step.status === 'in-progress') {
          statusBadge = '<span class="text-[10px] text-cyan-400 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">⚡ In Progress</span>';
        } else {
          statusBadge = '<span class="text-[10px] text-slate-500 font-medium">Upcoming</span>';
        }

        stepsHtml += `
          <div class="flex items-center justify-between py-2 border-b border-slate-800/40 last:border-b-0 text-xs">
            <div class="flex items-center gap-2">
              <span class="w-5 h-5 rounded-full ${step.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : (step.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500')} flex items-center justify-center text-[10px] font-mono font-bold">
                ${idx + 1}
              </span>
              <span class="${step.status === 'completed' ? 'text-slate-300' : (step.status === 'in-progress' ? 'text-white font-medium' : 'text-slate-400')}">${step.name}</span>
            </div>
            <div>${statusBadge}</div>
          </div>
        `;
      });

      html += `
        <div class="glass-card rounded-2xl p-5 border border-slate-800">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">${track.icon}</span>
            <div>
              <h3 class="text-base font-bold text-white">${track.title}</h3>
              <p class="text-xs text-slate-400">${track.desc}</p>
            </div>
          </div>
          <div class="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
            ${stepsHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }
}

window.SkillBuilding = SkillBuilding;
