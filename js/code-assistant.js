/**
 * CodeNova AI - Code Assistant Module
 * Handles Code Upload, Editor line numbering, Quick Actions, and Interactive Chat UI.
 */

const sampleSnippets = {
  python_bug: {
    lang: 'python',
    name: 'Python Buggy Search & Mutables',
    code: `# Buggy Python implementation with mutable default & missing colon
def search_items(query, cache=[]):
    cache.append(query)
    
    # Bug 1: Missing colon in if statement
    if len(cache) > 5
        print("Cache full! Evicting first item")
        cache.pop(0)
        
    items = ["apple", "banana", "cherry", "date"]
    
    # Bug 2: Off-by-one index error
    for i in range(len(items) + 1):
        if items[i] == query:
            return True
            
    return False

# Test run
print(search_items("banana"))
print(search_items("grape"))`
  },
  js_async_bug: {
    lang: 'javascript',
    name: 'JavaScript Async / Await Pitfall',
    code: `// Buggy JS: Unhandled Promises, loose equality & missing await
async function fetchUserDashboard(userId) {
    // Bug 1: Loose equality comparison
    if (userId == null) {
        throw new Error("Invalid User ID");
    }

    // Bug 2: Missing await keyword when fetching
    const response = fetch("https://api.example.com/users/" + userId);
    const data = response.json(); // Runtime error: response is a Promise!

    // Bug 3: Array filter mutation trap
    const activeTasks = data.tasks.filter(t => t.done = true);

    return {
        dashboard: data,
        count: activeTasks.length
    };
}`
  },
  java_bug: {
    lang: 'java',
    name: 'Java String Comparison & Null Pointer',
    code: `public class UserManager {
    private String role;

    public boolean isAdmin(String inputRole) {
        // Bug 1: Comparing Strings with == instead of .equals()
        if (inputRole == "ADMIN") {
            return true;
        }

        // Bug 2: Potential NullPointerException if role is null
        if (role.equalsIgnoreCase("SUPERADMIN")) {
            return true
        } // Bug 3: Missing semicolon on line above

        return false;
    }
}`
  },
  cpp_clean: {
    lang: 'cpp',
    name: 'C++ Binary Search Implementation',
    code: `#include <iostream>
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;

    while (low <= high) {
        // Prevent integer overflow
        int mid = low + (high - low) / 2;

        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return -1; // Not found
}

int main() {
    std::vector<int> nums = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
    std::cout << "Index of 23: " << binarySearch(nums, 23) << std::endl;
    return 0;
}`
  }
};

class CodeAssistant {
  constructor() {
    this.editor = document.getElementById('code-input');
    this.lineNumbers = document.getElementById('line-numbers');
    this.languageSelect = document.getElementById('code-language');
    this.chatContainer = document.getElementById('chat-history');
    this.fileUploadInput = document.getElementById('code-file-upload');
    this.dropZone = document.getElementById('code-drop-zone');
    this.userChatInput = document.getElementById('user-chat-input');
    this.btnSendChat = document.getElementById('btn-send-chat');

    this.initEventListeners();
    this.updateLineNumbers();
  }

  initEventListeners() {
    // Line numbers on input and scroll
    if (this.editor) {
      this.editor.addEventListener('input', () => this.updateLineNumbers());
      this.editor.addEventListener('scroll', () => {
        if (this.lineNumbers) this.lineNumbers.scrollTop = this.editor.scrollTop;
      });
      // Tab key support
      this.editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = this.editor.selectionStart;
          const end = this.editor.selectionEnd;
          this.editor.value = this.editor.value.substring(0, start) + '    ' + this.editor.value.substring(end);
          this.editor.selectionStart = this.editor.selectionEnd = start + 4;
          this.updateLineNumbers();
        }
      });

      // Auto check errors and explain code on Paste
      this.editor.addEventListener('paste', () => {
        setTimeout(() => {
          this.updateLineNumbers();
          const pasted = this.editor.value.trim();
          if (pasted.length > 5) {
            this.detectLanguage(pasted);
            this.showToast('🔍 Code pasted! Checking errors & explaining logic via Free AI...', 'info');
            this.runAction('explain_and_errors');
          }
        }, 80);
      });
    }

    // Combined Explain & Check Errors Button
    document.getElementById('btn-action-combined')?.addEventListener('click', () => {
      this.runAction('explain_and_errors');
    });

    // File Upload input
    if (this.fileUploadInput) {
      this.fileUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadFile(file);
      });
    }

    // Drag and Drop
    if (this.dropZone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.add('border-cyan-400', 'bg-cyan-950/20');
        }, false);
      });
      ['dragleave', 'drop'].forEach(eventName => {
        this.dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.dropZone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
        }, false);
      });
      this.dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) this.loadFile(file);
      });
    }

    // Sample Snippets dropdown
    const snippetSelector = document.getElementById('sample-snippets');
    if (snippetSelector) {
      snippetSelector.addEventListener('change', (e) => {
        const key = e.target.value;
        if (sampleSnippets[key]) {
          this.editor.value = sampleSnippets[key].code;
          this.languageSelect.value = sampleSnippets[key].lang;
          this.updateLineNumbers();
          this.showToast(`Loaded "${sampleSnippets[key].name}" snippet`);
        }
      });
    }

    // Quick Action Buttons
    document.getElementById('btn-action-explain')?.addEventListener('click', () => this.runAction('explain'));
    document.getElementById('btn-action-errors')?.addEventListener('click', () => this.runAction('errors'));
    document.getElementById('btn-action-optimize')?.addEventListener('click', () => this.runAction('optimize'));
    document.getElementById('btn-action-test')?.addEventListener('click', () => this.runAction('test'));

    // Custom Chat Send
    this.btnSendChat?.addEventListener('click', () => this.sendCustomMessage());
    this.userChatInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendCustomMessage();
      }
    });

    // Quick Doubt Chips for side panel chat
    document.querySelectorAll('.quick-doubt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const doubt = chip.dataset.doubt || chip.innerText.trim();
        if (this.userChatInput) {
          this.userChatInput.value = doubt;
          this.sendCustomMessage();
        }
      });
    });

    // Clear Chat
    document.getElementById('btn-clear-chat')?.addEventListener('click', () => {
      this.chatContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500">
          <div class="inline-flex p-3 rounded-full bg-slate-800/80 mb-3 text-cyan-400">
            <i data-lucide="bot" class="w-6 h-6"></i>
          </div>
          <p class="text-sm">Chat history cleared. Upload code or ask any programming question!</p>
        </div>
      `;
      lucide.createIcons();
    });

    // Subtab Switcher: Code Solver vs ChatGPT Doubt Solver
    const btnSubtabSolver = document.getElementById('btn-subtab-solver');
    const btnSubtabChatGPT = document.getElementById('btn-subtab-chatgpt');
    const viewSolver = document.getElementById('subtab-solver-view');
    const viewDoubt = document.getElementById('subtab-doubt-view');

    btnSubtabSolver?.addEventListener('click', () => {
      btnSubtabSolver.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white shadow-md transition flex items-center gap-2';
      btnSubtabChatGPT.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-2';
      viewSolver?.classList.remove('hidden');
      viewDoubt?.classList.add('hidden');
      lucide.createIcons();
    });

    btnSubtabChatGPT?.addEventListener('click', () => {
      btnSubtabChatGPT.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white shadow-md transition flex items-center gap-2';
      btnSubtabSolver.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-2';
      viewSolver?.classList.add('hidden');
      viewDoubt?.classList.remove('hidden');
      lucide.createIcons();
    });

    // ChatGPT Doubt Solver Events
    const btnSendDoubt = document.getElementById('btn-send-doubt');
    const inputDoubt = document.getElementById('doubt-user-input');

    btnSendDoubt?.addEventListener('click', () => this.sendDoubtMessage());
    inputDoubt?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendDoubtMessage();
      }
    });

    // Suggestion pills
    document.querySelectorAll('.doubt-suggestion-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const doubtText = pill.dataset.doubt || pill.innerText.replace(/^[⚡🧩🗄️💡🚀]\s*/, '').trim();
        if (inputDoubt) {
          inputDoubt.value = doubtText;
          this.sendDoubtMessage();
        }
      });
    });

    // Clear Doubt Chat
    document.getElementById('btn-clear-doubt-chat')?.addEventListener('click', () => {
      const container = document.getElementById('doubt-chat-history');
      if (container) {
        container.innerHTML = `
          <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 text-xs space-y-2">
            <div class="flex items-center gap-2 text-purple-400 font-bold">
              <i data-lucide="sparkles" class="w-4 h-4"></i>
              <span>ChatGPT Developer Doubt Solver Ready!</span>
            </div>
            <p class="text-slate-400 leading-relaxed">
              Ask any programming concept, language quirk, debugging question, or interview algorithm. I will provide comprehensive conceptual explanations, diagrams, time/space complexity analysis, and runnable clean code blocks!
            </p>
          </div>
        `;
        lucide.createIcons();
      }
    });

    // Clear Code Editor
    document.getElementById('btn-clear-editor')?.addEventListener('click', () => {
      this.editor.value = '';
      this.updateLineNumbers();
    });
  }

  updateLineNumbers() {
    if (!this.editor || !this.lineNumbers) return;
    const lines = this.editor.value.split('\n').length;
    let numbersHtml = '';
    for (let i = 1; i <= Math.max(lines, 12); i++) {
      numbersHtml += `<div>${i}</div>`;
    }
    this.lineNumbers.innerHTML = numbersHtml;
  }

  loadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.editor.value = e.target.result;
      this.updateLineNumbers();

      // Auto detect language from extension
      const ext = file.name.split('.').pop().toLowerCase();
      const extMap = {
        py: 'python',
        js: 'javascript',
        jsx: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        java: 'java',
        cpp: 'cpp',
        cc: 'cpp',
        c: 'c',
        cs: 'csharp',
        html: 'html',
        css: 'css',
        sql: 'sql',
        go: 'go',
        rs: 'rust',
        php: 'php',
        json: 'json'
      };
      if (extMap[ext]) {
        this.languageSelect.value = extMap[ext];
      }

      this.showToast(`Uploaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      this.appendUserMessage(`Uploaded file **${file.name}** (${file.size} bytes). Ready to analyze!`);
    };
    reader.readAsText(file);
  }

  detectLanguage(code) {
    if (!this.languageSelect) return;
    if (/(def\s+\w+|import\s+sys|import\s+os|print\(|:\s*$)/m.test(code) && !/(\{|\}|function)/.test(code)) {
      this.languageSelect.value = 'python';
    } else if (/(public\s+class|System\.out\.print|public\s+static\s+void)/.test(code)) {
      this.languageSelect.value = 'java';
    } else if (/(#include\s*<|std::|int\s+main\(\)|cout\s*<<)/.test(code)) {
      this.languageSelect.value = 'cpp';
    } else if (/(SELECT\s+.*FROM|UPDATE\s+.*SET|CREATE\s+TABLE)/i.test(code)) {
      this.languageSelect.value = 'sql';
    } else if (/(function\s+|const\s+|let\s+|console\.log|=>)/.test(code)) {
      this.languageSelect.value = 'javascript';
    }
  }

  async runAction(action) {
    const code = this.editor.value.trim();
    if (!code) {
      this.showToast('Please upload or enter code in the editor first!', 'warning');
      return;
    }

    const lang = this.languageSelect.value;
    const actionTitles = {
      explain_and_errors: '🔍 Check Errors & Explain Code',
      explain: 'Explain Code Architecture & Logic',
      errors: 'Detect Syntax & Runtime Errors',
      optimize: 'Optimize & Clean Refactor',
      test: 'Generate Unit Test Suite'
    };

    this.appendUserMessage(`🔍 **Action requested**: ${actionTitles[action] || action}`);
    const thinkingId = this.appendThinkingMessage();

    try {
      const response = await window.aiEngine.analyzeCode(action, code, lang);
      this.removeMessage(thinkingId);
      this.appendAssistantMessage(response, action);
    } catch (err) {
      this.removeMessage(thinkingId);
      this.appendAssistantMessage(`❌ **Error generating response**: ${err.message}`);
    }
  }

  async sendCustomMessage() {
    const prompt = this.userChatInput.value.trim();
    if (!prompt) return;

    const code = this.editor.value.trim();
    const lang = this.languageSelect.value;

    this.appendUserMessage(prompt);
    this.userChatInput.value = '';

    const thinkingId = this.appendThinkingMessage();

    try {
      const response = await window.aiEngine.analyzeCode('chat', code, lang, prompt);
      this.removeMessage(thinkingId);
      this.appendAssistantMessage(response);
    } catch (err) {
      this.removeMessage(thinkingId);
      this.appendAssistantMessage(`❌ **Error**: ${err.message}`);
    }
  }

  async sendDoubtMessage() {
    const input = document.getElementById('doubt-user-input');
    const prompt = input?.value.trim();
    if (!prompt) return;

    const includeCode = document.getElementById('doubt-include-code')?.checked;
    const code = includeCode ? this.editor.value.trim() : '';
    const lang = this.languageSelect.value;

    this.appendDoubtUserMessage(prompt);
    input.value = '';

    const thinkingId = this.appendDoubtThinkingMessage();

    try {
      const response = await window.aiEngine.analyzeCode('doubt', code, lang, prompt);
      this.removeMessage(thinkingId);
      this.appendDoubtAssistantMessage(response);
    } catch (err) {
      this.removeMessage(thinkingId);
      this.appendDoubtAssistantMessage(`❌ **Error**: ${err.message}`);
    }
  }

  appendDoubtUserMessage(content) {
    const container = document.getElementById('doubt-chat-history');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex justify-end mb-4';
    div.innerHTML = `
      <div class="max-w-[85%] bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-slate-100 shadow-md">
        <div class="text-xs text-purple-300 font-semibold mb-1 flex items-center gap-1 justify-end">
          <span>You</span>
          <i data-lucide="user" class="w-3.5 h-3.5"></i>
        </div>
        <div class="text-sm">${this.formatSimpleMarkdown(content)}</div>
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    lucide.createIcons();
  }

  appendDoubtThinkingMessage() {
    const container = document.getElementById('doubt-chat-history');
    const id = 'doubt-thinking-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex justify-start mb-4';
    div.innerHTML = `
      <div class="max-w-[85%] bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-300 shadow-lg flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs font-mono text-purple-300">ChatGPT AI is analyzing your doubt and writing answer...</span>
      </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return id;
  }

  appendDoubtAssistantMessage(markdownContent) {
    const container = document.getElementById('doubt-chat-history');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex justify-start mb-5 w-full';
    const formattedHtml = this.renderMarkdown(markdownContent);
    const msgId = 'doubt-msg-' + Date.now();

    div.innerHTML = `
      <div class="w-full max-w-full bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 rounded-2xl rounded-tl-sm p-4 text-slate-200 shadow-xl">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              AI
            </div>
            <span class="font-semibold text-purple-400">ChatGPT Developer Mentor</span>
            <span class="text-slate-500 text-[11px]">• ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button class="copy-response-btn text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1 text-[11px] transition">
            <i data-lucide="copy" class="w-3.5 h-3.5"></i>
            <span>Copy</span>
          </button>
        </div>
        <div id="${msgId}" class="markdown-body space-y-2">
          ${formattedHtml}
        </div>
      </div>
    `;

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    lucide.createIcons();

    div.querySelector('.copy-response-btn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(markdownContent);
      this.showToast('Copied answer to clipboard!');
    });

    div.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeText = btn.parentElement.nextElementSibling.innerText;
        navigator.clipboard.writeText(codeText);
        this.showToast('Code copied to clipboard!');
      });
    });
  }

  appendUserMessage(content) {
    const div = document.createElement('div');
    div.className = 'flex justify-end mb-4';
    div.innerHTML = `
      <div class="max-w-[85%] bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border border-cyan-500/30 rounded-2xl rounded-tr-sm px-4 py-3 text-slate-100 shadow-md">
        <div class="text-xs text-cyan-300 font-semibold mb-1 flex items-center gap-1 justify-end">
          <span>You</span>
          <i data-lucide="user" class="w-3.5 h-3.5"></i>
        </div>
        <div class="text-sm">${this.formatSimpleMarkdown(content)}</div>
      </div>
    `;
    this.chatContainer.appendChild(div);
    this.scrollToBottom();
    lucide.createIcons();
  }

  appendThinkingMessage() {
    const id = 'thinking-' + Date.now();
    const div = document.createElement('div');
    div.id = id;
    div.className = 'flex justify-start mb-4';
    div.innerHTML = `
      <div class="max-w-[85%] bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-300 shadow-lg flex items-center gap-3">
        <div class="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
        <span class="text-xs font-mono text-cyan-300">Elevora AI is analyzing code structure...</span>
      </div>
    `;
    this.chatContainer.appendChild(div);
    this.scrollToBottom();
    return id;
  }

  removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  appendAssistantMessage(markdownContent, actionType = '') {
    const div = document.createElement('div');
    div.className = 'flex justify-start mb-5 w-full';
    
    // Parse markdown to HTML
    const formattedHtml = this.renderMarkdown(markdownContent);
    const msgId = 'msg-' + Date.now();

    div.innerHTML = `
      <div class="w-full max-w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl rounded-tl-sm p-4 text-slate-200 shadow-xl">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-[10px]">
              AI
            </div>
            <span class="font-semibold text-cyan-400">Elevora Assistant</span>
            <span class="text-slate-500 text-[11px]">• ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="copy-response-btn text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1 text-[11px] transition" data-target="${msgId}">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copy</span>
            </button>
          </div>
        </div>
        <div id="${msgId}" class="markdown-body space-y-2">
          ${formattedHtml}
        </div>
      </div>
    `;

    this.chatContainer.appendChild(div);
    this.scrollToBottom();
    lucide.createIcons();

    // Hook copy button
    div.querySelector('.copy-response-btn')?.addEventListener('click', (e) => {
      navigator.clipboard.writeText(markdownContent);
      this.showToast('Copied response to clipboard!');
    });

    // Hook code block copy buttons
    div.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.addEventListener('click', () => {
        const codeText = btn.parentElement.nextElementSibling.innerText;
        navigator.clipboard.writeText(codeText);
        this.showToast('Code copied to clipboard!');
      });
    });
  }

  scrollToBottom() {
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }

  formatSimpleMarkdown(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-cyan-300 font-mono text-xs">$1</code>');
  }

  renderMarkdown(md) {
    // Basic Markdown Parser for headings, tables, code blocks, lists, quotes
    let html = md;

    // Code blocks with syntax copy header
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const displayLang = (lang || 'code').toUpperCase();
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
        <div class="my-3 rounded-lg overflow-hidden border border-slate-800 bg-[#070b13]">
          <div class="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 text-xs font-mono text-slate-400 border-b border-slate-700/60">
            <span class="text-cyan-400 font-semibold">${displayLang}</span>
            <button class="btn-copy-code flex items-center gap-1 text-slate-400 hover:text-white transition">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i>
              <span>Copy Code</span>
            </button>
          </div>
          <pre class="p-3 text-xs font-mono text-slate-200 overflow-x-auto"><code>${escaped}</code></pre>
        </div>
      `;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-cyan-300 mt-3 mb-1 flex items-center gap-1.5">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-sm font-semibold text-slate-200 mt-2 mb-1">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-white mt-4 mb-2">$1</h2>');

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-cyan-500 pl-3 py-1 my-2 bg-cyan-950/20 text-slate-300 italic text-xs rounded-r">$1</blockquote>');

    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>');

    // Unordered lists
    html = html.replace(/^\s*-\s+(.*$)/gim, '<li class="ml-4 list-disc text-slate-300 text-xs my-0.5">$1</li>');

    // Tables
    html = html.replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim().length > 0);
      if (cells.some(c => c.includes('---'))) return '';
      const tdList = cells.map(c => `<td class="border border-slate-800 px-2.5 py-1 text-xs">${c.trim()}</td>`).join('');
      return `<tr class="hover:bg-slate-800/40">${tdList}</tr>`;
    });

    // Wrap tables in styled wrapper
    if (html.includes('<tr>')) {
      html = html.replace(/(<tr.*?>[\s\S]*?<\/tr>)+/g, '<div class="overflow-x-auto my-2"><table class="w-full border-collapse border border-slate-800 text-left text-xs bg-slate-900/60 rounded">$&</table></div>');
    }

    // Paragraph line breaks
    html = html.split('\n\n').map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<') || p.startsWith('div') || p.startsWith('table')) return p;
      return `<p class="text-xs text-slate-300 leading-relaxed mb-2">${p}</p>`;
    }).join('');

    return html;
  }

  showToast(msg, type = 'info') {
    window.app?.showToast?.(msg, type);
  }
}

window.CodeAssistant = CodeAssistant;
