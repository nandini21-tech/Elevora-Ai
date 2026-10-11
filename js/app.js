/**
 * CodeNova AI - Master Application Controller
 * Handles SPA tab switching, authentication gating, global settings modal, toasts, and initialization.
 */

class App {
  constructor() {
    this.currentTab = 'dashboard';
    this.initNavigation();
    this.initSettingsModal();
    this.initModules();
    this.initDashboardActions();
    this.updateAIStatusBadge();
  }

  initNavigation() {
    const navButtons = document.querySelectorAll('.nav-tab-btn');

    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        if (target) this.switchTab(target);
      });
    });
  }

  switchTab(target) {
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Update active button state
    navButtons.forEach(b => {
      if (b.dataset.tab === target) {
        b.classList.add('bg-cyan-500/15', 'text-cyan-400', 'border-cyan-500/30');
        b.classList.remove('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50');
      } else {
        b.classList.remove('bg-cyan-500/15', 'text-cyan-400', 'border-cyan-500/30');
        b.classList.add('text-slate-400', 'hover:text-slate-200', 'hover:bg-slate-800/50');
      }
    });

    // Show matching pane
    tabPanes.forEach(pane => {
      if (pane.id === `tab-${target}`) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    });

    this.currentTab = target;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Refresh icons and goal widget if needed
    if (target === 'dashboard' && window.goalTracker) {
      window.goalTracker.renderDashboardWidget();
    }
    lucide.createIcons();
  }

  initDashboardActions() {
    // Mini quick-tester on dashboard
    document.getElementById('btn-dash-test-code')?.addEventListener('click', () => {
      const miniCode = document.getElementById('dash-quick-code')?.value.trim();
      const miniLang = document.getElementById('dash-quick-lang')?.value || 'python';
      
      this.switchTab('assistant');

      if (miniCode && window.codeAssistant) {
        window.codeAssistant.editor.value = miniCode;
        window.codeAssistant.languageSelect.value = miniLang;
        window.codeAssistant.updateLineNumbers();
        window.codeAssistant.runAction('errors');
      }
    });

    // Quick Action shortcuts from dashboard cards
    document.querySelectorAll('[data-goto-tab]').forEach(el => {
      el.addEventListener('click', () => {
        const tab = el.dataset.gotoTab;
        if (tab) this.switchTab(tab);
      });
    });
  }

  initSettingsModal() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-settings');
    const saveBtn = document.getElementById('btn-save-settings');
    const apiKeyInput = document.getElementById('setting-gemini-key');
    const modelSelect = document.getElementById('setting-gemini-model');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => {
        apiKeyInput.value = window.aiEngine?.getApiKey() || '';
        modelSelect.value = window.aiEngine?.modelName || 'gemini-3.8-flash';
        modal.classList.remove('hidden');
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        const model = modelSelect.value;
        window.aiEngine?.setApiKey(key);
        window.aiEngine?.setModel(model);
        modal.classList.add('hidden');
        this.updateAIStatusBadge();
        this.showToast(key ? 'Google Gemini 3.8 Flash connected!' : 'Switched to offline intelligent heuristic engine.', 'success');
      });
    }
  }

  updateAIStatusBadge() {
    const badge = document.getElementById('ai-status-indicator');
    if (!badge) return;

    if (window.aiEngine?.hasApiKey()) {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-medium text-emerald-300">Gemini 3.8 Flash (Active)</span>
      `;
      badge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 cursor-pointer';
    } else {
      badge.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="text-xs font-medium text-cyan-300">Elevora AI Backend (Active)</span>
      `;
      badge.className = 'flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition';
    }

    badge.onclick = () => {
      document.getElementById('btn-open-settings')?.click();
    };
  }

  initModules() {
    // Initialize module controllers
    window.codeAssistant = new window.CodeAssistant();
    window.goalTracker = new window.GoalTracker();
    window.resumeBuilder = new window.ResumeBuilder();
    window.pdfLibrary = new window.PDFLibrary();
    window.skillBuilding = new window.SkillBuilding();
    window.authManager = new window.AuthManager();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
      info: 'border-cyan-500/40 bg-slate-900 text-cyan-300',
      success: 'border-emerald-500/40 bg-slate-900 text-emerald-300',
      warning: 'border-amber-500/40 bg-slate-900 text-amber-300',
      danger: 'border-rose-500/40 bg-slate-900 text-rose-300'
    };

    toast.className = `p-3 px-4 rounded-xl border shadow-2xl text-xs flex items-center gap-2.5 transition-all transform duration-300 translate-y-4 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `
      <span class="font-medium">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  lucide.createIcons();
});
