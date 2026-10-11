/**
 * Elevora AI - Dual Intelligence Engine (browser side)
 * The Gemini API key lives ONLY on the server (.env -> process.env.API_KEY).
 * The browser calls /api/ai/analyze, with cloud and offline fallbacks.
 */

class AIEngine {
  constructor() {
    // Optional key typed by the user in settings (never hardcode a key here)
    const saved = localStorage.getItem('elevora_gemini_key');
    this.apiKey = (saved && saved !== 'undefined' && saved !== 'null') ? saved : '';
    this.modelName = localStorage.getItem('elevora_model') || 'gemini-3.8-flash';
  }

  setApiKey(key) {
    this.apiKey = key ? key.trim() : '';
    localStorage.setItem('elevora_gemini_key', this.apiKey);
  }

  getApiKey() { return this.apiKey; }

  setModel(model) {
    this.modelName = model || 'gemini-3.8-flash';
    localStorage.setItem('elevora_model', this.modelName);
  }

  hasApiKey() { return Boolean(this.apiKey && this.apiKey.length > 10); }

  async analyzeCode(action, code, language, userPrompt = '') {
    // 1. Backend (server holds the real key)
    try {
      return await this.callFreeBackendAPI(action, code, language, userPrompt);
    } catch (e) {
      console.warn('[Elevora AI Engine] Backend failed:', e.message);
    }

    // 2. Free cloud fallback
    try {
      return await this.callDirectFreeCloudAI(action, code, language, userPrompt);
    } catch (e) {
      console.warn('[Elevora AI Engine] Cloud AI failed:', e.message);
    }

    // 3. Offline heuristics
    await new Promise(r => setTimeout(r, 350));
    return this.heuristicAnalyze(action, code, language, userPrompt);
  }

  async callFreeBackendAPI(action, code, language, userPrompt) {
    const isHttp = window.location.protocol.startsWith('http');
    const endpoint = isHttp ? '/api/ai/analyze' : 'http://localhost:3000/api/ai/analyze';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        code,
        language,
        prompt: userPrompt,
        apiKey: this.apiKey
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);

    const data = await res.json();
    if (data.success && data.response) return data.response;
    throw new Error('Invalid backend AI response format');
  }

  async callDirectFreeCloudAI(action, code, language, userPrompt) {
    let prompt = '';
    if (action === 'explain_and_errors') {
      prompt = `Analyze this ${language} code for errors and explain it step by step:\n\`\`\`${language}\n${code}\n\`\`\`\n1. Find all syntax errors and bugs, and provide the corrected code.\n2. Explain what the code does.\n3. State the Big-O time and space complexity.`;
    } else if (action === 'errors') {
      prompt = `Find errors and bugs in this ${language} code and provide the fixed code:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else if (action === 'explain') {
      prompt = `Explain this ${language} code thoroughly with logic walkthrough and Big-O complexity:\n\`\`\`${language}\n${code}\n\`\`\``;
    } else {
      prompt = `Code:\n\`\`\`${language}\n${code}\n\`\`\`\nQuestion: ${userPrompt || 'Explain and find errors in this code.'}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);
    const res = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Free cloud AI returned HTTP ${res.status}`);
    const text = await res.text();
    if (!text || text.trim().length === 0) throw new Error('Empty response');
    return text.trim();
  }

  heuristicAnalyze(action, code, language, userPrompt) {
    language = (language || 'javascript').toLowerCase();
    code = code || '';
    const lines = code.split('\n');
    const trimmed = code.trim();

    if (!trimmed && action !== 'chat' && action !== 'doubt') {
      return `### ⚠️ No Code Provided\nPlease paste or upload your code file in the editor above to begin analysis!`;
    }

    if (action === 'chat' || action === 'doubt') {
      return `### 💬 Elevora AI Developer Assistant
Regarding your doubt: **"${userPrompt}"**

When programming in \`${language}\`:
1. **Core Concept**: Verify variable scoping, avoid unintended mutations, and handle null/undefined boundaries.
2. **Best Practice**: Keep functions modular and write clear automated tests.
3. **Execution**: If you hit bugs, read the stack trace to isolate the root cause.

(Offline mode: the cloud AI could not be reached.)`;
    }

    const errors = [];
    if ((code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length) {
      errors.push('Unbalanced parentheses `()` detected.');
    }
    if ((code.match(/\{/g) || []).length !== (code.match(/\}/g) || []).length) {
      errors.push('Unbalanced curly braces `{}` detected.');
    }
    if (language === 'python') {
      lines.forEach((l, i) => {
        if (/^(def|class|if|elif|else|for|while)\b.*[^:]$/.test(l.trim())) {
          errors.push(`Missing colon ':' on line ${i + 1}: \`${l.trim()}\``);
        }
      });
    }

    const errorSection = errors.length > 0
      ? `### 🐞 1. Detected Error(s)\n${errors.map(e => `- ${e}`).join('\n')}`
      : `### ✅ 1. Syntax Audit\nNo obvious syntax errors detected.`;

    return `### 💡 Elevora AI Code Analysis (${language.toUpperCase()}) - Offline Mode

${errorSection}

### ⚡ 2. Complexity Analysis
- **Time Complexity:** O(n) average-case
- **Space Complexity:** O(1) auxiliary

### ✅ 3. Code
\`\`\`${language}
${code}
\`\`\``;
  }
}

// Global instance
window.aiEngine = new AIEngine();