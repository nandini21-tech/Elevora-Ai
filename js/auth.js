/**
 * Elevora AI - Authentication & Database User Manager
 * Provides user registration, login, session tokens, and SQLite database sync
 * with seamless offline/standalone fallback.
 */

class AuthManager {
  constructor() {
    this.currentUser = this.loadUser();
    this.token = localStorage.getItem('elevora_auth_token') || '';
    this.initElements();
    this.initEventListeners();
    this.applyAuthState();
    this.syncProfileWithServer();
  }

  loadUser() {
    const saved = localStorage.getItem('elevora_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return null;
  }

  saveUser(user, token = null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('elevora_auth_user', JSON.stringify(user));
      if (token) {
        this.token = token;
        localStorage.setItem('elevora_auth_token', token);
      }
    } else {
      localStorage.removeItem('elevora_auth_user');
      localStorage.removeItem('elevora_auth_token');
      this.token = '';
    }
    this.applyAuthState();
  }

  async syncProfileWithServer() {
    if (!this.token) return;
    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const res = await fetch(`${base}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          this.currentUser = { ...this.currentUser, ...data.user };
          localStorage.setItem('elevora_auth_user', JSON.stringify(this.currentUser));
          this.applyAuthState();
        }
      }
    } catch (e) {
      // Server not running or offline, keep local user
    }
  }

  initElements() {
    this.authView = document.getElementById('auth-view');
    this.appView = document.getElementById('app-view');
    this.intentModal = document.getElementById('intent-modal');

    this.loginForm = document.getElementById('form-login');
    this.registerForm = document.getElementById('form-register');

    this.tabLoginBtn = document.getElementById('btn-tab-signin');
    this.tabRegisterBtn = document.getElementById('btn-tab-signup');
    this.btnDemoLogin = document.getElementById('btn-demo-login');
    this.btnLogout = document.getElementById('btn-user-logout');

    this.userProfilePill = document.getElementById('header-user-profile');
    this.headerUserName = document.getElementById('header-user-name');
    this.headerUserRole = document.getElementById('header-user-role');
  }

  initEventListeners() {
    // Switch between Sign In and Sign Up tabs
    this.tabLoginBtn?.addEventListener('click', () => {
      this.tabLoginBtn.classList.add('bg-cyan-600', 'text-white');
      this.tabLoginBtn.classList.remove('text-slate-400');
      this.tabRegisterBtn.classList.remove('bg-cyan-600', 'text-white');
      this.tabRegisterBtn.classList.add('text-slate-400');
      this.loginForm.classList.remove('hidden');
      this.registerForm.classList.add('hidden');
    });

    this.tabRegisterBtn?.addEventListener('click', () => {
      this.tabRegisterBtn.classList.add('bg-cyan-600', 'text-white');
      this.tabRegisterBtn.classList.remove('text-slate-400');
      this.tabLoginBtn.classList.remove('bg-cyan-600', 'text-white');
      this.tabLoginBtn.classList.add('text-slate-400');
      this.registerForm.classList.remove('hidden');
      this.loginForm.classList.add('hidden');
    });

    // Sign In Submit
    this.loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      if (!email || !password) return;

      const submitBtn = this.loginForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Signing in...</span>`;

      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        const res = await fetch(`${base}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            this.saveUser(data.user, data.token);
            window.app?.showToast?.(`Welcome back, ${data.user.name}! Connected to SQLite DB.`, 'success');
            setTimeout(() => this.showIntentModal(), 400);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend login endpoint unavailable, using local authentication:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      // Standalone Fallback
      const userName = email.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
      this.loginUser({
        id: `usr-${Date.now().toString(36)}`,
        name: formattedName || 'Developer',
        email: email,
        role: 'Full Stack Engineer',
        avatar: '👨‍💻',
        xp: 250,
        streak: 7
      });
    });

    // Register Submit
    this.registerForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const role = document.getElementById('reg-role').value;
      const password = document.getElementById('reg-pass')?.value || 'password123';

      if (!email) return;

      const submitBtn = this.registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Creating account...</span>`;

      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        const res = await fetch(`${base}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            this.saveUser(data.user, data.token);
            window.app?.showToast?.(`Account created in SQLite database! Welcome, ${data.user.name}.`, 'success');
            setTimeout(() => this.showIntentModal(), 400);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend register failed, using local registration:', err);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }

      // Standalone Fallback
      this.loginUser({
        id: `usr-${Date.now().toString(36)}`,
        name: name || 'Developer',
        email: email || 'coder@elevora.dev',
        role: role || 'Software Engineer',
        avatar: '🚀',
        xp: 250,
        streak: 7
      });
    });

    // 1-Click Demo Login
    this.btnDemoLogin?.addEventListener('click', async () => {
      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        const res = await fetch(`${base}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'pretham.dev@elevora.ai', password: 'coder1234' })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            this.saveUser(data.user, data.token);
            window.app?.showToast?.(`Logged in as ${data.user.name} via SQLite database!`, 'success');
            setTimeout(() => this.showIntentModal(), 350);
            return;
          }
        }
      } catch (e) { }

      // Offline Demo Profile
      this.loginUser({
        id: 'usr-demo-1',
        name: 'Pretham',
        email: 'pretham.dev@elevora.ai',
        role: 'Senior Full Stack Engineer',
        avatar: '⚡',
        xp: 350,
        streak: 7
      });
    });

    // Logout
    this.btnLogout?.addEventListener('click', () => {
      this.logout();
    });

    // "What do you want to do?" Cards Inside Intent Modal
    document.querySelectorAll('.intent-action-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetTab = card.dataset.tab;
        this.closeIntentModal();
        if (targetTab && window.app) {
          window.app.switchTab(targetTab);
        }
      });
    });

    // Skip / Close Intent Modal
    document.getElementById('btn-close-intent-modal')?.addEventListener('click', () => {
      this.closeIntentModal();
    });
    document.getElementById('btn-intent-to-dashboard')?.addEventListener('click', () => {
      this.closeIntentModal();
      window.app?.switchTab?.('dashboard');
    });

    // Open Intent Modal from Header or Dashboard
    document.getElementById('btn-open-intent')?.addEventListener('click', () => {
      this.showIntentModal();
    });
    document.getElementById('btn-dashboard-open-intent')?.addEventListener('click', () => {
      this.showIntentModal();
    });
  }

  loginUser(userData) {
    this.saveUser(userData);
    window.app?.showToast?.(`Welcome to Elevora, ${userData.name}!`, 'success');
    
    setTimeout(() => {
      this.showIntentModal();
    }, 400);
  }

  async logout() {
    if (this.token) {
      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        await fetch(`${base}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
      } catch (e) { }
    }
    this.saveUser(null);
    window.app?.showToast?.('Logged out safely.', 'info');
  }

  applyAuthState() {
    if (this.currentUser) {
      this.authView?.classList.add('hidden');
      this.appView?.classList.remove('hidden');

      if (this.userProfilePill) {
        this.userProfilePill.classList.remove('hidden');
        if (this.headerUserName) this.headerUserName.innerText = this.currentUser.name;
        if (this.headerUserRole) this.headerUserRole.innerText = this.currentUser.role;
      }

      const dashGreeting = document.getElementById('dashboard-greeting-name');
      if (dashGreeting) dashGreeting.innerText = this.currentUser.name;

    } else {
      this.authView?.classList.remove('hidden');
      this.appView?.classList.add('hidden');
      if (this.userProfilePill) {
        this.userProfilePill.classList.add('hidden');
      }
    }
    lucide.createIcons();
  }

  showIntentModal() {
    if (!this.intentModal) return;
    const modalGreeting = document.getElementById('intent-modal-greeting');
    if (modalGreeting && this.currentUser) {
      modalGreeting.innerText = `Welcome, ${this.currentUser.name}! 🚀 What would you like to achieve today with Elevora?`;
    }
    this.intentModal.classList.remove('hidden');
    lucide.createIcons();
  }

  closeIntentModal() {
    if (this.intentModal) {
      this.intentModal.classList.add('hidden');
    }
  }
}

window.AuthManager = AuthManager;
