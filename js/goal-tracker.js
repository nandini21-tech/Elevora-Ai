/**
 * Elevora AI - Developer Goal Tracker & Daily/Weekly/Monthly Roadmap Engine
 * Features:
 * - AI Day-by-Day Roadmap Generation for any duration (e.g. 30 days)
 * - Tickable daily subtask tracking
 * - Day Tracker (Daily Focus & Today's tasks)
 * - Week Tracker (7-Day Sprint breakdown)
 * - Monthly Tracker (30-Day Grid Calendar Matrix & Consistency)
 * - SQLite Database sync with local offline fallback
 */

const defaultGoalsData = [
  {
    id: 'goal-python-30',
    title: 'Master Python 3 Core & OOP in 30 Days',
    category: 'Backend / Scripting',
    priority: 'High',
    days: 30,
    targetDate: '2026-11-09',
    subtasks: [
      { id: 'st-p-1', dayNumber: 1, text: 'Day 1: Python 3 Installation, Virtualenv & Hello World', done: true },
      { id: 'st-p-2', dayNumber: 2, text: 'Day 2: Variables, Primitive Types (int, float, str, bool)', done: true },
      { id: 'st-p-3', dayNumber: 3, text: 'Day 3: Control Flow (if, elif, else) & Boolean Logic', done: true },
      { id: 'st-p-4', dayNumber: 4, text: 'Day 4: Loops (while, for) & Range Generator', done: true },
      { id: 'st-p-5', dayNumber: 5, text: 'Day 5: Lists: Methods, Slicing & Mutability', done: true },
      { id: 'st-p-6', dayNumber: 6, text: 'Day 6: Tuples, Sets & Hash Uniqueness', done: false },
      { id: 'st-p-7', dayNumber: 7, dayNumber: 7, text: 'Day 7: Dictionaries: Key-Value Mapping & Iteration', done: false },
      { id: 'st-p-8', dayNumber: 8, text: 'Day 8: List & Dictionary Comprehensions', done: false },
      { id: 'st-p-9', dayNumber: 9, text: 'Day 9: Functions: Scope, Default Args & *args/**kwargs', done: false },
      { id: 'st-p-10', dayNumber: 10, text: 'Day 10: Lambda Functions, Map, Filter & Sorted', done: false },
      { id: 'st-p-11', dayNumber: 11, text: 'Day 11: Error Handling: try, except, finally blocks', done: false },
      { id: 'st-p-12', dayNumber: 12, text: 'Day 12: File I/O: Reading & Writing text and JSON files', done: false },
      { id: 'st-p-13', dayNumber: 13, text: 'Day 13: OOP Basics: Classes, Objects & self', done: false },
      { id: 'st-p-14', dayNumber: 14, text: 'Day 14: OOP Inheritance, super() & Polymorphism', done: false },
      { id: 'st-p-15', dayNumber: 15, text: 'Day 15: Dunder Methods (__init__, __str__, __repr__)', done: false },
      { id: 'st-p-16', dayNumber: 16, text: 'Day 16: Modules, Packages & Pip Dependency Management', done: false },
      { id: 'st-p-17', dayNumber: 17, text: 'Day 17: Regular Expressions (re module) & Pattern Validation', done: false },
      { id: 'st-p-18', dayNumber: 18, text: 'Day 18: Iterators & Custom Generators with yield', done: false },
      { id: 'st-p-19', dayNumber: 19, text: 'Day 19: Decorators & Higher-Order Wrapping', done: false },
      { id: 'st-p-20', dayNumber: 20, text: 'Day 20: Standard Library Deep Dive: datetime, math, sys', done: false },
      { id: 'st-p-21', dayNumber: 21, text: 'Day 21: REST API Requests with Requests library', done: false },
      { id: 'st-p-22', dayNumber: 22, text: 'Day 22: Data Manipulation Basics with Pandas', done: false },
      { id: 'st-p-23', dayNumber: 23, text: 'Day 23: Fast Web Server with FastAPI / Flask', done: false },
      { id: 'st-p-24', dayNumber: 24, text: 'Day 24: Database Persistence with SQLite & CRUD', done: false },
      { id: 'st-p-25', dayNumber: 25, text: 'Day 25: Unit Testing with pytest & Test Assertions', done: false },
      { id: 'st-p-26', dayNumber: 26, text: 'Day 26: Clean Code, PEP 8 Linting & Type Hints', done: false },
      { id: 'st-p-27', dayNumber: 27, text: 'Day 27: Concurrency: Asyncio & Async/Await syntax', done: false },
      { id: 'st-p-28', dayNumber: 28, text: 'Day 28: Capstone Project: Build Complete CLI Utility', done: false },
      { id: 'st-p-29', dayNumber: 29, text: 'Day 29: Debugging, Refactoring & Performance Profiling', done: false },
      { id: 'st-p-30', dayNumber: 30, text: 'Day 30: Packaging, Documentation & 30-Day Graduation', done: false }
    ]
  },
  {
    id: 'goal-dsa-14',
    title: 'Blind 75 LeetCode DSA Patterns Sprint',
    category: 'DSA & Algorithms',
    priority: 'High',
    days: 14,
    targetDate: '2026-10-24',
    subtasks: [
      { id: 'st-dsa-1', dayNumber: 1, text: 'Day 1: Two Pointers: Valid Palindrome & Container With Most Water', done: true },
      { id: 'st-dsa-2', dayNumber: 2, text: 'Day 2: Sliding Window: Longest Substring Without Repeating Characters', done: true },
      { id: 'st-dsa-3', dayNumber: 3, text: 'Day 3: Prefix Sum & Hash Maps: Two Sum & Group Anagrams', done: true },
      { id: 'st-dsa-4', dayNumber: 4, text: 'Day 4: Binary Search: Rotated Sorted Array & Search Matrix', done: false },
      { id: 'st-dsa-5', dayNumber: 5, text: 'Day 5: Linked Lists: Reverse List & Merge Two Sorted Lists', done: false },
      { id: 'st-dsa-6', dayNumber: 6, text: 'Day 6: Fast & Slow Pointers: Linked List Cycle Detection', done: false },
      { id: 'st-dsa-7', dayNumber: 7, text: 'Day 7: Monotonic Stack: Daily Temperatures & Valid Parentheses', done: false },
      { id: 'st-dsa-8', dayNumber: 8, text: 'Day 8: Binary Trees: Invert Tree & Maximum Depth', done: false },
      { id: 'st-dsa-9', dayNumber: 9, text: 'Day 9: Binary Search Trees: Lowest Common Ancestor & Validate BST', done: false },
      { id: 'st-dsa-10', dayNumber: 10, text: 'Day 10: Breadth-First Search: Tree Level Order Traversal', done: false },
      { id: 'st-dsa-11', dayNumber: 11, text: 'Day 11: Graphs: Number of Islands & Clone Graph', done: false },
      { id: 'st-dsa-12', dayNumber: 12, text: 'Day 12: Graphs: Course Schedule (Topological Sort)', done: false },
      { id: 'st-dsa-13', dayNumber: 13, text: 'Day 13: Dynamic Programming: Climbing Stairs & Coin Change', done: false },
      { id: 'st-dsa-14', dayNumber: 14, text: 'Day 14: Dynamic Programming: Longest Increasing Subsequence (LIS)', done: false }
    ]
  }
];

class GoalTracker {
  constructor() {
    this.goals = this.loadGoals();
    this.streak = parseInt(localStorage.getItem('elevora_streak') || '7', 10);
    this.lastActiveDate = localStorage.getItem('elevora_last_active') || '';
    this.activeFilter = 'All';
    this.activeView = 'all'; // 'all' | 'day' | 'week' | 'month'
    this.selectedWeek = 1;
    this.selectedMonthDay = 1;

    this.container = document.getElementById('goals-list-container');
    this.statsContainer = document.getElementById('goal-stats');
    this.modal = document.getElementById('add-goal-modal');

    this.initEventListeners();
    this.syncGoalsWithServer();
    this.render();
  }

  loadGoals() {
    const saved = localStorage.getItem('elevora_goals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return defaultGoalsData;
  }

  saveGoals() {
    localStorage.setItem('elevora_goals', JSON.stringify(this.goals));
    localStorage.setItem('elevora_streak', this.streak.toString());
    this.updateStats();
  }

  async syncGoalsWithServer() {
    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const token = localStorage.getItem('elevora_auth_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${base}/api/goals`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.goals) && data.goals.length > 0) {
          this.goals = data.goals;
          localStorage.setItem('elevora_goals', JSON.stringify(this.goals));
          this.render();
        }
      }
    } catch (e) {
      // Offline fallback
    }
  }

  initEventListeners() {
    // Filter buttons (Category)
    document.querySelectorAll('.goal-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.goal-filter-btn').forEach(b => {
          b.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40');
          b.classList.add('bg-slate-800/60', 'text-slate-400', 'border-slate-700');
        });
        btn.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40');
        btn.classList.remove('bg-slate-800/60', 'text-slate-400');
        this.activeFilter = btn.dataset.filter;
        this.render();
      });
    });

    // View Switcher Buttons (Req 7: All vs Day vs Week vs Month)
    document.querySelectorAll('.tracker-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tracker-view-btn').forEach(b => {
          b.classList.remove('bg-cyan-600', 'text-white', 'shadow-md');
          b.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800/60');
        });
        btn.classList.add('bg-cyan-600', 'text-white', 'shadow-md');
        btn.classList.remove('text-slate-400');
        this.activeView = btn.dataset.view;
        this.render();
      });
    });

    // Add Goal Button & Modal
    document.getElementById('btn-open-add-goal')?.addEventListener('click', () => {
      this.modal.classList.remove('hidden');
    });

    document.getElementById('btn-close-goal-modal')?.addEventListener('click', () => {
      this.modal.classList.add('hidden');
    });

    // Preset Days Buttons in Modal
    document.querySelectorAll('.preset-days-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = btn.dataset.days;
        const daysInput = document.getElementById('goal-days-input');
        if (daysInput) {
          daysInput.value = days;
          this.updateTargetDateByDays(parseInt(days, 10));
        }
        document.querySelectorAll('.preset-days-btn').forEach(b => {
          b.classList.remove('bg-cyan-600', 'text-white', 'border-cyan-400');
          b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-700');
        });
        btn.classList.add('bg-cyan-600', 'text-white', 'border-cyan-400');
        btn.classList.remove('bg-slate-900', 'text-slate-400');
      });
    });

    // Duration input change listener
    document.getElementById('goal-days-input')?.addEventListener('input', (e) => {
      const days = parseInt(e.target.value, 10) || 30;
      this.updateTargetDateByDays(days);
    });

    // "✨ AI Generate Day-by-Day Plan" Button inside Modal
    document.getElementById('btn-ai-generate-plan')?.addEventListener('click', async () => {
      await this.generateAIPlanInModal();
    });

    document.getElementById('form-add-goal')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.addNewGoal();
    });

    // Manual Subtask adder inside modal
    document.getElementById('btn-add-modal-subtask')?.addEventListener('click', () => {
      const subtaskContainer = document.getElementById('modal-subtasks-list');
      const count = subtaskContainer.querySelectorAll('.subtask-item-row').length + 1;
      const div = document.createElement('div');
      div.className = 'subtask-item-row flex items-center gap-2 mb-2';
      div.innerHTML = `
        <span class="text-[10px] font-mono text-cyan-400 w-12 shrink-0">Day ${count}</span>
        <input type="text" class="subtask-input flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400" placeholder="e.g. Master Binary Search recursion" value="Day ${count}: Task milestone">
        <button type="button" class="text-rose-400 hover:text-rose-300 p-1" onclick="this.parentElement.remove()">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      `;
      subtaskContainer.appendChild(div);
      lucide.createIcons();
    });

    // Log Daily Streak Button
    document.getElementById('btn-log-streak')?.addEventListener('click', () => {
      this.logStreakActivity();
    });
  }

  updateTargetDateByDays(days) {
    const dateInput = document.getElementById('goal-date-input');
    if (!dateInput) return;
    const target = new Date();
    target.setDate(target.getDate() + (days || 30));
    dateInput.value = target.toISOString().slice(0, 10);
  }

  async generateAIPlanInModal() {
    const title = document.getElementById('goal-title-input')?.value.trim();
    const category = document.getElementById('goal-category-select')?.value || 'Web Development';
    const days = parseInt(document.getElementById('goal-days-input')?.value, 10) || 30;

    if (!title) {
      window.app?.showToast?.('Please enter a Goal Title first (e.g. "Learn Python Basics")', 'warning');
      return;
    }

    const aiBtn = document.getElementById('btn-ai-generate-plan');
    const originalText = aiBtn.innerHTML;
    aiBtn.disabled = true;
    aiBtn.innerHTML = `
      <span class="inline-block animate-spin mr-1.5">⚡</span>
      <span>Elevora AI is analyzing goal & creating ${days}-day roadmap...</span>
    `;

    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const res = await fetch(`${base}/api/goals/ai-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, days })
      });

      let subtasks = [];
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.subtasks)) {
          subtasks = data.subtasks;
        }
      }

      if (subtasks.length === 0) {
        // Fallback local generator
        subtasks = this.generateLocalPlan(title, category, days);
      }

      this.populateModalSubtasks(subtasks);
      window.app?.showToast?.(`✨ Elevora AI successfully generated a complete ${days}-day daily plan!`, 'success');

    } catch (err) {
      const subtasks = this.generateLocalPlan(title, category, days);
      this.populateModalSubtasks(subtasks);
      window.app?.showToast?.(`✨ Generated ${days}-day roadmap!`, 'success');
    } finally {
      aiBtn.disabled = false;
      aiBtn.innerHTML = originalText;
      lucide.createIcons();
    }
  }

  generateLocalPlan(title, category, days) {
    const list = [];
    for (let d = 1; d <= days; d++) {
      list.push({
        id: `st-local-${d}-${Date.now()}`,
        dayNumber: d,
        text: `Day ${d}: ${title} — Focused Session & Practical Exercises`,
        done: false
      });
    }
    return list;
  }

  populateModalSubtasks(subtasks) {
    const container = document.getElementById('modal-subtasks-list');
    if (!container) return;
    container.innerHTML = '';

    subtasks.forEach(st => {
      const div = document.createElement('div');
      div.className = 'subtask-item-row flex items-center gap-2 mb-2';
      div.innerHTML = `
        <span class="text-[10px] font-mono text-cyan-400 w-14 shrink-0 font-bold">Day ${st.dayNumber}</span>
        <input type="text" class="subtask-input flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400" value="${st.text}" data-day="${st.dayNumber}">
        <button type="button" class="text-rose-400 hover:text-rose-300 p-1" onclick="this.parentElement.remove()">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      `;
      container.appendChild(div);
    });

    const indicator = document.getElementById('modal-plan-summary-badge');
    if (indicator) {
      indicator.innerText = `${subtasks.length} Daily Tasks Generated`;
      indicator.classList.remove('hidden');
    }
    lucide.createIcons();
  }

  logStreakActivity() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.lastActiveDate === today) {
      window.app?.showToast?.('🔥 You already checked in today! Streak is active.', 'info');
      return;
    }

    this.streak += 1;
    this.lastActiveDate = today;
    localStorage.setItem('elevora_last_active', today);
    this.saveGoals();
    this.triggerConfetti();
    window.app?.showToast?.(`🔥 Daily Activity Recorded! Elevora streak increased to ${this.streak} days!`, 'success');
    this.render();
  }

  async addNewGoal() {
    const title = document.getElementById('goal-title-input').value.trim();
    const category = document.getElementById('goal-category-select').value;
    const priority = document.getElementById('goal-priority-select').value;
    const days = parseInt(document.getElementById('goal-days-input').value, 10) || 30;
    const targetDate = document.getElementById('goal-date-input').value;

    const subtaskInputs = document.querySelectorAll('.subtask-input');
    let subtasks = [];
    subtaskInputs.forEach((inp, idx) => {
      if (inp.value.trim()) {
        const dayNum = parseInt(inp.dataset.day, 10) || (idx + 1);
        subtasks.push({
          id: `st-${Date.now()}-${idx}`,
          dayNumber: dayNum,
          text: inp.value.trim(),
          done: false
        });
      }
    });

    if (!title) {
      alert('Please enter a goal title.');
      return;
    }

    // If user created a goal without clicking AI plan, generate full day roadmap automatically!
    if (subtasks.length === 0) {
      for (let d = 1; d <= days; d++) {
        subtasks.push({
          id: `st-auto-${Date.now()}-${d}`,
          dayNumber: d,
          text: `Day ${d}: ${title} — Step ${d} milestone`,
          done: false
        });
      }
    }

    const newGoal = {
      id: 'goal-' + Date.now(),
      title,
      category,
      priority,
      days,
      targetDate: targetDate || new Date(Date.now() + days * 86400000).toISOString().slice(0, 10),
      subtasks
    };

    this.goals.unshift(newGoal);
    this.saveGoals();

    // Sync to SQLite Backend
    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const token = localStorage.getItem('elevora_auth_token');
      await fetch(`${base}/api/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newGoal)
      });
    } catch (e) { }

    this.modal.classList.add('hidden');
    document.getElementById('form-add-goal').reset();
    document.getElementById('modal-subtasks-list').innerHTML = `
      <div class="subtask-item-row flex items-center gap-2 mb-2">
        <span class="text-[10px] font-mono text-cyan-400 w-14 shrink-0 font-bold">Day 1</span>
        <input type="text" class="subtask-input flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-400" placeholder="Milestone 1, e.g. Setup & syntax basics">
      </div>
    `;

    this.render();
    this.triggerConfetti();
    window.app?.showToast?.(`🎯 Goal "${title}" with ${days}-day plan created successfully!`, 'success');
  }

  async toggleSubtask(goalId, subtaskId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const subtask = goal.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    subtask.done = !subtask.done;
    this.saveGoals();

    // Sync to SQLite Backend
    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const token = localStorage.getItem('elevora_auth_token');
      await fetch(`${base}/api/goals/${goalId}/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ done: subtask.done })
      });
    } catch (e) { }

    // Check if whole goal completed
    const allDone = goal.subtasks.every(s => s.done);
    if (allDone && subtask.done) {
      this.triggerConfetti();
      window.app?.showToast?.(`🎉 Outstanding! You completed all ${goal.subtasks.length} days of "${goal.title}"!`, 'success');
    } else if (subtask.done) {
      window.app?.showToast?.(`✅ Day ${subtask.dayNumber || ''} task checked off! Keep up the momentum.`, 'info');
    }

    this.render();
  }

  async deleteGoal(goalId) {
    if (confirm('Are you sure you want to remove this goal and its roadmap?')) {
      this.goals = this.goals.filter(g => g.id !== goalId);
      this.saveGoals();

      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        const token = localStorage.getItem('elevora_auth_token');
        await fetch(`${base}/api/goals/${goalId}`, {
          method: 'DELETE',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
      } catch (e) { }

      this.render();
      window.app?.showToast?.('Goal removed.', 'info');
    }
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      });
    }
  }

  updateStats() {
    const totalGoals = this.goals.length;
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    let completedGoals = 0;

    this.goals.forEach(g => {
      const doneCount = g.subtasks.filter(s => s.done).length;
      totalSubtasks += g.subtasks.length;
      completedSubtasks += doneCount;
      if (g.subtasks.length > 0 && doneCount === g.subtasks.length) {
        completedGoals++;
      }
    });

    const overallPct = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

    // Top header stats
    const headerStreak = document.getElementById('stat-header-streak');
    if (headerStreak) headerStreak.innerText = `${this.streak}d`;

    const headerGoals = document.getElementById('stat-header-goals');
    if (headerGoals) headerGoals.innerText = `${completedGoals}/${totalGoals}`;

    if (this.statsContainer) {
      this.statsContainer.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="glass-card p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Active Streak</span>
              <span class="text-amber-400 text-base">🔥</span>
            </div>
            <div class="text-2xl font-bold text-white font-mono">${this.streak} <span class="text-xs text-amber-400 font-sans font-normal">days active</span></div>
          </div>
          <div class="glass-card p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Overall Roadmap Progress</span>
              <span class="text-cyan-400 text-base">📈</span>
            </div>
            <div class="text-2xl font-bold text-cyan-400 font-mono">${overallPct}%</div>
            <div class="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div class="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style="width: ${overallPct}%"></div>
            </div>
          </div>
          <div class="glass-card p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Completed Goals</span>
              <span class="text-emerald-400 text-base">🏆</span>
            </div>
            <div class="text-2xl font-bold text-emerald-400 font-mono">${completedGoals} <span class="text-xs text-slate-400 font-sans font-normal">of ${totalGoals}</span></div>
          </div>
          <div class="glass-card p-4 rounded-xl border border-slate-800">
            <div class="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Daily Tasks Mastered</span>
              <span class="text-purple-400 text-base">⚡</span>
            </div>
            <div class="text-2xl font-bold text-purple-400 font-mono">${completedSubtasks} <span class="text-xs text-slate-400 font-sans font-normal">/ ${totalSubtasks} days</span></div>
          </div>
        </div>
      `;
    }
  }

  render() {
    this.updateStats();
    if (!this.container) return;

    if (this.activeView === 'day') {
      this.renderDayTracker();
    } else if (this.activeView === 'week') {
      this.renderWeekTracker();
    } else if (this.activeView === 'month') {
      this.renderMonthTracker();
    } else {
      this.renderAllGoals();
    }

    this.renderDashboardWidget();
    lucide.createIcons();
  }

  // ==========================================
  // VIEW 1: ALL GOALS & ROADMAPS
  // ==========================================
  renderAllGoals() {
    let filtered = this.goals;
    if (this.activeFilter !== 'All') {
      filtered = this.goals.filter(g =>
        g.category.toLowerCase().includes(this.activeFilter.toLowerCase()) ||
        (this.activeFilter === 'Completed' && g.subtasks.every(s => s.done))
      );
    }

    if (filtered.length === 0) {
      this.container.innerHTML = `
        <div class="col-span-full text-center py-12 glass-card rounded-2xl border border-slate-800">
          <i data-lucide="target" class="w-10 h-10 text-slate-500 mx-auto mb-3"></i>
          <p class="text-slate-400 text-sm">No goals found under "${this.activeFilter}".</p>
          <button class="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition" onclick="document.getElementById('btn-open-add-goal').click()">
            Create a New Goal
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(goal => {
      const completedCount = goal.subtasks.filter(s => s.done).length;
      const totalCount = goal.subtasks.length;
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const isFinished = totalCount > 0 && completedCount === totalCount;
      const duration = goal.days || totalCount || 30;

      let subtasksHtml = '';
      goal.subtasks.forEach(st => {
        subtasksHtml += `
          <label class="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/40 cursor-pointer transition select-none group">
            <input type="checkbox" class="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
              ${st.done ? 'checked' : ''}
              onchange="window.goalTracker.toggleSubtask('${goal.id}', '${st.id}')"
            >
            <div class="flex items-center gap-1.5 flex-1 min-w-0">
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded ${st.done ? 'bg-slate-800 text-slate-500' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'} font-bold shrink-0">
                Day ${st.dayNumber || ''}
              </span>
              <span class="text-xs ${st.done ? 'line-through text-slate-500' : 'text-slate-300 group-hover:text-white'} leading-snug truncate">
                ${st.text}
              </span>
            </div>
          </label>
        `;
      });

      html += `
        <div class="glass-card rounded-2xl p-5 border ${isFinished ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-slate-800/80'} transition-all hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-3 mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full border text-cyan-400 bg-cyan-950/40 border-cyan-800/50">
                    ${goal.category}
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-800/60 font-mono">
                    ${duration} Days Plan
                  </span>
                  ${isFinished ? '<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">✓ Mastered</span>' : ''}
                </div>
                <h3 class="text-base font-bold text-white tracking-tight ${isFinished ? 'line-through text-slate-400' : ''}">${goal.title}</h3>
              </div>
              <button class="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/40 transition shrink-0" title="Delete Goal" onclick="window.goalTracker.deleteGoal('${goal.id}')">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>

            <!-- Progress Bar -->
            <div class="mb-4">
              <div class="flex justify-between text-xs mb-1.5 font-mono">
                <span class="text-slate-400">${completedCount} of ${totalCount} daily tasks completed</span>
                <span class="${pct === 100 ? 'text-emerald-400 font-bold' : 'text-cyan-400'}">${pct}%</span>
              </div>
              <div class="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-500 to-violet-500'}" style="width: ${pct}%"></div>
              </div>
            </div>

            <!-- Daily Subtask Roadmap (Scrollable) -->
            <div class="space-y-0.5 border-t border-slate-800/60 pt-2.5 max-h-56 overflow-y-auto pr-1">
              ${subtasksHtml}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500">
            <span class="flex items-center gap-1 font-mono">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              Target: ${goal.targetDate || 'Flexible'}
            </span>
            <span class="text-slate-400 font-medium">
              ${isFinished ? '🏆 Completed' : `${totalCount - completedCount} days left`}
            </span>
          </div>
        </div>
      `;
    });

    this.container.innerHTML = html;
  }

  // ==========================================
  // VIEW 2: DAY TRACKER (DAILY FOCUS) - Req 7
  // ==========================================
  renderDayTracker() {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    let tasksForToday = [];

    this.goals.forEach(g => {
      // Find the first uncompleted task, or current day task
      const nextPending = g.subtasks.find(s => !s.done) || g.subtasks[g.subtasks.length - 1];
      if (nextPending) {
        tasksForToday.push({
          goalId: g.id,
          goalTitle: g.title,
          category: g.category,
          subtask: nextPending
        });
      }
    });

    let tasksHtml = '';
    if (tasksForToday.length === 0) {
      tasksHtml = `
        <div class="p-8 text-center text-slate-400 text-xs">
          <i data-lucide="sparkles" class="w-8 h-8 text-emerald-400 mx-auto mb-2"></i>
          <p class="font-bold text-white text-sm">All daily tasks are up-to-date!</p>
          <p class="text-slate-500 mt-1">Create a new goal or enjoy your progress.</p>
        </div>
      `;
    } else {
      tasksForToday.forEach(item => {
        const st = item.subtask;
        tasksHtml += `
          <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-4 hover:border-cyan-500/40 transition">
            <div class="flex items-start gap-3">
              <input type="checkbox" class="mt-1 rounded border-slate-700 bg-slate-950 text-cyan-500 w-4 h-4 cursor-pointer"
                ${st.done ? 'checked' : ''}
                onchange="window.goalTracker.toggleSubtask('${item.goalId}', '${st.id}')"
              >
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                    Day ${st.dayNumber || 1}
                  </span>
                  <span class="text-[10px] text-slate-400">${item.goalTitle}</span>
                </div>
                <h4 class="text-sm font-bold text-white ${st.done ? 'line-through text-slate-500' : ''}">${st.text}</h4>
              </div>
            </div>
            <button class="px-3 py-1 rounded-lg text-xs font-semibold ${st.done ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-cyan-600 text-white hover:bg-cyan-500'} transition" onclick="window.goalTracker.toggleSubtask('${item.goalId}', '${st.id}')">
              ${st.done ? 'Done ✓' : 'Mark Done'}
            </button>
          </div>
        `;
      });
    }

    this.container.innerHTML = `
      <div class="col-span-full space-y-6">
        <!-- Daily Header Banner -->
        <div class="glass-card rounded-2xl p-6 border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/80 to-purple-950/30">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold mb-1">
                <span>☀️ DAILY FOCUS TRACKER</span>
                <span>•</span>
                <span>${today}</span>
              </div>
              <h2 class="text-xl font-bold text-white">Today's High-Impact Milestones</h2>
              <p class="text-xs text-slate-400 mt-1">Consistency compounds. Complete today's tasks to maintain your active streak!</p>
            </div>
            <div class="flex items-center gap-3">
              <button id="btn-log-streak-dayview" class="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-2" onclick="window.goalTracker.logStreakActivity()">
                <span>🔥 Check In Today (${this.streak}d streak)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Today's Tasks List -->
        <div class="space-y-3">
          ${tasksHtml}
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW 3: WEEK TRACKER (7-DAY SPRINT) - Req 7
  // ==========================================
  renderWeekTracker() {
    const activeGoal = this.goals[0] || null;
    if (!activeGoal) {
      this.container.innerHTML = `<div class="col-span-full text-center py-8 text-slate-400">No active roadmaps found.</div>`;
      return;
    }

    const totalDays = activeGoal.subtasks.length || 30;
    const totalWeeks = Math.ceil(totalDays / 7);
    const currentWeek = Math.min(Math.max(this.selectedWeek || 1, 1), totalWeeks);

    const startIdx = (currentWeek - 1) * 7;
    const weekTasks = activeGoal.subtasks.slice(startIdx, startIdx + 7);
    const completedInWeek = weekTasks.filter(s => s.done).length;
    const weekPct = weekTasks.length > 0 ? Math.round((completedInWeek / weekTasks.length) * 100) : 0;

    let weekTabs = '';
    for (let w = 1; w <= totalWeeks; w++) {
      const isSel = w === currentWeek;
      weekTabs += `
        <button class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${isSel ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}" onclick="window.goalTracker.selectedWeek = ${w}; window.goalTracker.render();">
          Week ${w} (Days ${(w - 1) * 7 + 1}-${Math.min(w * 7, totalDays)})
        </button>
      `;
    }

    let daysHtml = '';
    weekTasks.forEach((st, idx) => {
      const dayIndex = startIdx + idx + 1;
      daysHtml += `
        <div class="glass-card rounded-2xl p-4 border ${st.done ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 bg-slate-900/60'} hover:border-cyan-500/40 transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold ${st.done ? 'text-emerald-400' : 'text-cyan-400'}">Day ${st.dayNumber || dayIndex}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full ${st.done ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}">
                ${st.done ? 'Completed ✓' : 'Pending'}
              </span>
            </div>
            <p class="text-xs font-medium text-slate-200 mb-3 leading-relaxed ${st.done ? 'line-through text-slate-400' : ''}">${st.text}</p>
          </div>
          <button class="w-full py-1.5 rounded-lg text-xs font-bold transition ${st.done ? 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800' : 'bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white'}" onclick="window.goalTracker.toggleSubtask('${activeGoal.id}', '${st.id}')">
            ${st.done ? 'Completed ✓' : 'Mark as Done'}
          </button>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="col-span-full space-y-6">
        <!-- Week Tracker Header -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">📅 7-DAY SPRINT TRACKER</span>
              <span class="text-xs text-slate-400">• Goal: <strong>${activeGoal.title}</strong></span>
            </div>
            <h3 class="text-base font-bold text-white">Sprint Velocity: ${completedInWeek} of ${weekTasks.length} Days Mastered (${weekPct}%)</h3>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            ${weekTabs}
          </div>
        </div>

        <!-- 7 Days Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${daysHtml}
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW 4: MONTHLY TRACKER (30-DAY GRID) - Req 7
  // ==========================================
  renderMonthTracker() {
    const activeGoal = this.goals[0] || null;
    if (!activeGoal) {
      this.container.innerHTML = `<div class="col-span-full text-center py-8 text-slate-400">No active roadmaps found.</div>`;
      return;
    }

    const totalDays = Math.min(activeGoal.subtasks.length || 30, 30);
    const doneDays = activeGoal.subtasks.filter(s => s.done).length;
    const consistencyPct = Math.round((doneDays / totalDays) * 100);

    let gridCells = '';
    for (let d = 1; d <= totalDays; d++) {
      const st = activeGoal.subtasks[d - 1] || { dayNumber: d, text: `Day ${d} task`, done: false };
      const isSelected = d === this.selectedMonthDay;

      gridCells += `
        <div class="p-3 rounded-xl border cursor-pointer transition flex flex-col items-center justify-center text-center relative ${st.done ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' : (isSelected ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200' : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700')}"
          onclick="window.goalTracker.selectedMonthDay = ${d}; window.goalTracker.render();">
          <span class="text-[10px] font-mono text-slate-400 mb-1">Day</span>
          <span class="text-base font-black font-mono">${d}</span>
          <span class="text-[11px] mt-1">${st.done ? '✓' : '○'}</span>
        </div>
      `;
    }

    // Selected Day Focus Card
    const selectedTask = activeGoal.subtasks[this.selectedMonthDay - 1] || null;

    this.container.innerHTML = `
      <div class="col-span-full space-y-6">
        <!-- Month Banner -->
        <div class="glass-card rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 font-bold">🗓️ 30-DAY CALENDAR MATRIX</span>
              <span class="text-xs text-slate-400">• ${activeGoal.title}</span>
            </div>
            <h3 class="text-base font-bold text-white">Monthly Consistency: ${consistencyPct}% (${doneDays} / ${totalDays} Days Completed)</h3>
          </div>
          <div class="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/50">
            <span>🔥 Streak: ${this.streak} Days Active</span>
          </div>
        </div>

        <!-- 30-Day Interactive Matrix -->
        <div class="glass-card rounded-2xl p-5 border border-slate-800">
          <div class="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 mb-6">
            ${gridCells}
          </div>

          <!-- Selected Day Focus Details -->
          ${selectedTask ? `
            <div class="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span class="text-[11px] font-mono text-cyan-400 font-bold">Selected: Day ${selectedTask.dayNumber || this.selectedMonthDay}</span>
                <h4 class="text-sm font-bold text-white mt-0.5 ${selectedTask.done ? 'line-through text-slate-500' : ''}">${selectedTask.text}</h4>
              </div>
              <button class="px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${selectedTask.done ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'}" onclick="window.goalTracker.toggleSubtask('${activeGoal.id}', '${selectedTask.id}')">
                ${selectedTask.done ? 'Completed ✓ (Click to Undo)' : 'Mark Day Completed ✓'}
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // ==========================================
  // DASHBOARD WIDGET
  // ==========================================
  renderDashboardWidget() {
    const dashWidget = document.getElementById('dashboard-goals-widget');
    if (!dashWidget) return;

    let html = '';
    const displayGoals = this.goals.slice(0, 3);

    displayGoals.forEach(goal => {
      const completedCount = goal.subtasks.filter(s => s.done).length;
      const totalCount = goal.subtasks.length;
      const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const isFinished = totalCount > 0 && completedCount === totalCount;

      let subtasksHtml = '';
      goal.subtasks.slice(0, 3).forEach(st => {
        subtasksHtml += `
          <label class="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-800/40 cursor-pointer select-none group">
            <input type="checkbox" class="mt-0.5 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
              ${st.done ? 'checked' : ''}
              onchange="window.goalTracker.toggleSubtask('${goal.id}', '${st.id}')"
            >
            <span class="text-xs ${st.done ? 'line-through text-slate-500' : 'text-slate-300 group-hover:text-white'} leading-tight truncate">
              <strong class="text-cyan-400 font-mono text-[10px] mr-1">Day ${st.dayNumber || ''}</strong>${st.text}
            </span>
          </label>
        `;
      });

      html += `
        <div class="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 mb-2.5">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[11px] font-semibold text-cyan-400 font-mono">${goal.category} (${goal.days || totalCount}d)</span>
            <span class="text-[11px] font-bold ${pct === 100 ? 'text-emerald-400' : 'text-slate-400'}">${pct}%</span>
          </div>
          <h4 class="text-xs font-bold text-white mb-2 ${isFinished ? 'line-through text-slate-400' : ''}">${goal.title}</h4>
          <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2.5">
            <div class="h-full rounded-full ${pct === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}" style="width: ${pct}%"></div>
          </div>
          <div class="space-y-0.5">
            ${subtasksHtml}
          </div>
        </div>
      `;
    });

    dashWidget.innerHTML = html;
  }
}

window.GoalTracker = GoalTracker;
