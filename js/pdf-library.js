/**
 * Elevora AI - Cheat Sheets & PDF Library Module
 * Features:
 * - Curated developer quick-reference guides (Python, Java, JS, TS, C++, SQL, React, Git)
 * - Custom PDF Upload, In-App Interactive Reading, and Direct Download (Req 4)
 * - SQLite Database sync with local offline fallback
 * - Client-side jsPDF document synthesis
 */

const cheatSheetsData = [
  {
    id: 'python',
    title: 'Python 3 Developer Quick Reference',
    category: 'Backend / Scripting',
    version: 'Python 3.12+',
    icon: '🐍',
    color: 'from-amber-500/20 to-blue-500/20 border-blue-500/30',
    description: 'Comprehensive cheat sheet covering Python syntax, data structures, list comprehensions, decorators, generators, error handling, and file I/O.',
    sections: [
      {
        title: 'Core Data Structures & Methods',
        content: `Lists: append(x), extend(L), insert(i, x), remove(x), pop([i]), index(x), count(x), sort(), reverse()
Tuples: Immutable sequences, e.g. point = (10, 20)
Dicts: get(k, default), keys(), values(), items(), update(d), setdefault()
Sets: add(x), remove(x), discard(x), union(|), intersection(&), difference(-)`
      },
      {
        title: 'Comprehensions & Idioms',
        content: `# List Comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dict Comprehension
id_map = {user.id: user.name for user in users}

# Generator Expression (Memory Efficient)
total = sum(x*x for x in range(1000000))`
      },
      {
        title: 'Functions, *args, **kwargs & Decorators',
        content: `def logged(fn):
    def wrapper(*args, **kwargs):
        print(f"Calling {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@logged
def compute(x: int, y: int = 10) -> int:
    return x * y`
      },
      {
        title: 'Exception Handling & Context Managers',
        content: `try:
    with open('data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
except FileNotFoundError as err:
    print(f"File missing: {err}")
except Exception as err:
    print(f"Unexpected: {err}")
finally:
    print("Cleanup completed")`
      }
    ]
  },
  {
    id: 'java',
    title: 'Java 21 Enterprise & Core Reference',
    category: 'Enterprise Backend',
    version: 'Java 21 LTS',
    icon: '☕',
    color: 'from-orange-500/20 to-rose-500/20 border-orange-500/30',
    description: 'Master Java Collections Framework, Streams API, Concurrency, Virtual Threads, Records, Pattern Matching, and Exception handling.',
    sections: [
      {
        title: 'Collections Framework Essentials',
        content: `List<String> list = new ArrayList<>(); // Resizable array
Set<Integer> set = new HashSet<>();     // Unique values O(1)
Map<String, User> map = new HashMap<>();// Key-Value pairs O(1)
Queue<Task> queue = new LinkedList<>(); // FIFO Queue
PriorityQueue<Integer> pq = new PriorityQueue<>(); // Min-heap`
      },
      {
        title: 'Modern Java: Records & Pattern Matching',
        content: `// Java 17+ Record
public record UserDTO(String id, String username, int score) {}

// Pattern Matching for switch (Java 21)
static String formatObj(Object obj) {
    return switch (obj) {
        case Integer i -> String.format("Integer: %d", i);
        case String s  -> String.format("String of length: %d", s.length());
        case null      -> "Null reference";
        default        -> obj.toString();
    };
}`
      },
      {
        title: 'Streams API & Functional Lambdas',
        content: `List<String> activeUsernames = users.stream()
    .filter(u -> u.isActive())
    .map(User::getUsername)
    .sorted()
    .collect(Collectors.toList());

// Reduce aggregation
int totalSum = numbers.stream().reduce(0, Integer::sum);`
      },
      {
        title: 'Virtual Threads (Project Loom)',
        content: `// Java 21 Lightweight Virtual Threads
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return i;
        });
    });
}`
      }
    ]
  },
  {
    id: 'javascript',
    title: 'Modern JavaScript (ES6 - ES2024)',
    category: 'Full Stack Web',
    version: 'ES2024 / Node 22+',
    icon: '⚡',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
    description: 'Comprehensive JS guide: Promises, Async/Await, Array functional methods, Closures, Event Loop, Destructuring, and Modules.',
    sections: [
      {
        title: 'Async Programming: Promises & Async/Await',
        content: `// Async / Await with try/catch
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
        return await response.json();
    } catch (err) {
        console.error("Fetch failed:", err.message);
        throw err;
    }
}

// Concurrent Promise execution
const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);`
      },
      {
        title: 'Array Power Methods (Immutability)',
        content: `const nums = [1, 2, 3, 4, 5];

const doubled = nums.map(n => n * 2);           // [2, 4, 6, 8, 10]
const evens   = nums.filter(n => n % 2 === 0);  // [2, 4]
const sum     = nums.reduce((acc, n) => acc + n, 0); // 15
const found   = nums.find(n => n > 3);          // 4
const hasEven = nums.some(n => n % 2 === 0);    // true`
      },
      {
        title: 'Closures & Scope Chain',
        content: `function createCounter(initial = 0) {
    let count = initial;
    return {
        increment: () => ++count,
        decrement: () => --count,
        getValue: () => count
    };
}
const counter = createCounter(10);
counter.increment(); // 11`
      }
    ]
  },
  {
    id: 'sql',
    title: 'SQL & Relational Database Reference',
    category: 'Data & Databases',
    version: 'PostgreSQL & MySQL',
    icon: '🗄️',
    color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30',
    description: 'Essential SQL queries: SELECT, JOINs (INNER, LEFT, RIGHT, FULL), Window Functions, Indexing, and Transactions.',
    sections: [
      {
        title: 'Advanced JOINs & Aggregations',
        content: `-- Inner and Left Joins with Aggregations
SELECT u.id, u.name, COUNT(o.id) AS total_orders, COALESCE(SUM(o.amount), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2026-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 2
ORDER BY total_spent DESC;`
      },
      {
        title: 'Window Functions (ROW_NUMBER & RANK)',
        content: `SELECT 
    employee_id, department_id, salary,
    RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as dept_salary_rank,
    AVG(salary) OVER (PARTITION BY department_id) as dept_avg_salary
FROM employees;`
      },
      {
        title: 'Transactions & ACID Isolation',
        content: `BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 500 WHERE id = 'acc-1';
UPDATE accounts SET balance = balance + 500 WHERE id = 'acc-2';
-- Commit on success or ROLLBACK on failure
COMMIT;`
      }
    ]
  }
];

class PDFLibrary {
  constructor() {
    this.uploadedPdfs = this.loadUploadedPdfs();
    this.activeFilter = 'All';
    this.searchQuery = '';

    this.grid = document.getElementById('cheat-sheet-grid');
    this.modal = document.getElementById('cheat-sheet-modal');
    this.searchInput = document.getElementById('cheat-sheet-search');

    this.initEventListeners();
    this.syncUploadedPdfsWithServer();
    this.render();
  }

  loadUploadedPdfs() {
    const saved = localStorage.getItem('elevora_uploaded_pdfs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  }

  saveUploadedPdfs() {
    localStorage.setItem('elevora_uploaded_pdfs', JSON.stringify(this.uploadedPdfs));
  }

  async syncUploadedPdfsWithServer() {
    try {
      const isHttp = window.location.protocol.startsWith('http');
      const base = isHttp ? '' : 'http://localhost:3000';
      const token = localStorage.getItem('elevora_auth_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${base}/api/pdf/list`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.list)) {
          // Merge server PDF metadata
          const existingIds = new Set(this.uploadedPdfs.map(p => p.id));
          data.list.forEach(item => {
            if (!existingIds.has(item.id)) {
              this.uploadedPdfs.push(item);
            }
          });
          this.saveUploadedPdfs();
          this.render();
        }
      }
    } catch (e) { }
  }

  initEventListeners() {
    // Search input
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.render();
    });

    // Close Modal
    document.getElementById('btn-close-cheat-modal')?.addEventListener('click', () => {
      this.modal.classList.add('hidden');
    });

    // Upload PDF File Input Listener
    const pdfFileInput = document.getElementById('upload-pdf-file-input');
    pdfFileInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) await this.handlePdfFileUpload(file);
      e.target.value = '';
    });

    // Drag and Drop support on Upload Card
    const dropZone = document.getElementById('pdf-upload-drop-zone');
    if (dropZone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          dropZone.classList.add('border-cyan-400', 'bg-cyan-950/20');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          dropZone.classList.remove('border-cyan-400', 'bg-cyan-950/20');
        });
      });
      dropZone.addEventListener('drop', async (e) => {
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
          await this.handlePdfFileUpload(file);
        } else {
          window.app?.showToast?.('Please upload a valid PDF file.', 'warning');
        }
      });
    }
  }

  // Handle PDF File Upload (Req 4)
  async handlePdfFileUpload(file) {
    if (!file || file.type !== 'application/pdf') {
      window.app?.showToast?.('Please select a valid .pdf file.', 'warning');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      window.app?.showToast?.('PDF exceeds 20MB limit.', 'warning');
      return;
    }

    window.app?.showToast?.(`Reading "${file.name}"...`, 'info');

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target.result;
      const pdfId = `pdf-${Date.now()}`;
      const title = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      const formattedTitle = title.charAt(0).toUpperCase() + title.slice(1);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      const newPdf = {
        id: pdfId,
        title: formattedTitle,
        filename: file.name,
        category: 'Custom Upload',
        fileSize: file.size,
        fileSizeStr: sizeStr,
        fileData: base64Data,
        createdAt: new Date().toISOString()
      };

      this.uploadedPdfs.unshift(newPdf);
      this.saveUploadedPdfs();

      // Sync to SQLite Backend
      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        const token = localStorage.getItem('elevora_auth_token');
        await fetch(`${base}/api/pdf/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            title: formattedTitle,
            filename: file.name,
            category: 'Custom Upload',
            fileData: base64Data,
            fileSize: file.size
          })
        });
      } catch (err) { }

      this.render();
      window.app?.showToast?.(`✅ "${file.name}" uploaded to Elevora Library! You can read or download anytime.`, 'success');
    };

    reader.readAsDataURL(file);
  }

  async readUploadedPdf(pdfId) {
    let pdf = this.uploadedPdfs.find(p => p.id === pdfId);
    if (!pdf) return;

    // If fileData is missing, fetch from server
    if (!pdf.fileData) {
      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        const res = await fetch(`${base}/api/pdf/file/${pdfId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.pdf) {
            pdf = data.pdf;
          }
        }
      } catch (e) { }
    }

    if (!pdf.fileData) {
      window.app?.showToast?.('Unable to load PDF data.', 'danger');
      return;
    }

    document.getElementById('cheat-modal-title').innerText = pdf.title;
    document.getElementById('cheat-modal-version').innerText = 'PDF Reader';

    // Download Button in modal
    const downloadBtn = document.getElementById('btn-download-modal-pdf');
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadUploadedPdf(pdfId);
    }

    // Embed PDF Viewer
    const modalBody = document.getElementById('cheat-modal-body');
    modalBody.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-400">
          <span>Viewing: <strong>${pdf.filename}</strong></span>
          <span>Size: ${pdf.fileSizeStr || (Math.round((pdf.fileSize || 0) / 1024) + ' KB')}</span>
        </div>
        <div class="w-full h-[68vh] rounded-xl overflow-hidden border border-slate-800 bg-[#070b13]">
          <iframe src="${pdf.fileData}" class="w-full h-full border-0 rounded-xl" title="${pdf.title}"></iframe>
        </div>
      </div>
    `;

    this.modal.classList.remove('hidden');
    lucide.createIcons();
  }

  downloadUploadedPdf(pdfId) {
    const pdf = this.uploadedPdfs.find(p => p.id === pdfId);
    if (!pdf || !pdf.fileData) {
      window.app?.showToast?.('PDF content not found.', 'danger');
      return;
    }

    const a = document.createElement('a');
    a.href = pdf.fileData;
    a.download = pdf.filename || `${pdf.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.app?.showToast?.(`⬇️ Downloaded "${pdf.filename}" successfully!`, 'success');
  }

  async deleteUploadedPdf(pdfId) {
    if (confirm('Delete this uploaded PDF from your library?')) {
      this.uploadedPdfs = this.uploadedPdfs.filter(p => p.id !== pdfId);
      this.saveUploadedPdfs();

      try {
        const isHttp = window.location.protocol.startsWith('http');
        const base = isHttp ? '' : 'http://localhost:3000';
        await fetch(`${base}/api/pdf/${pdfId}`, { method: 'DELETE' });
      } catch (e) { }

      this.render();
      window.app?.showToast?.('PDF removed.', 'info');
    }
  }

  openReader(id) {
    const sheet = cheatSheetsData.find(s => s.id === id);
    if (!sheet) return;

    document.getElementById('cheat-modal-title').innerText = sheet.title;
    document.getElementById('cheat-modal-version').innerText = sheet.version;

    const downloadBtn = document.getElementById('btn-download-modal-pdf');
    if (downloadBtn) {
      downloadBtn.onclick = () => this.downloadPDF(sheet);
    }

    let contentHtml = `<p class="text-xs text-slate-400 mb-4">${sheet.description}</p>`;
    sheet.sections.forEach(sec => {
      contentHtml += `
        <div class="mb-4 bg-slate-900/80 rounded-xl p-4 border border-slate-800">
          <h4 class="text-sm font-bold text-cyan-400 mb-2">${sec.title}</h4>
          <pre class="bg-black/60 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800"><code>${sec.content}</code></pre>
        </div>
      `;
    });

    document.getElementById('cheat-modal-body').innerHTML = contentHtml;
    this.modal.classList.remove('hidden');
    lucide.createIcons();
  }

  downloadPDF(sheet) {
    window.app?.showToast?.(`Generating ${sheet.title} PDF with Elevora...`, 'info');

    if (!window.jspdf) {
      window.app?.showToast?.('jsPDF library loading...', 'warning');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header Background
    doc.setFillColor(7, 10, 18);
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Title
    doc.setTextColor(6, 182, 212); // Cyan
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Elevora AI: ${sheet.title}`, 14, 13);

    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate
    doc.setFont('helvetica', 'normal');
    doc.text(`${sheet.version} | ${sheet.category} | Developer Cheat Sheet Guide`, 14, 21);

    y = 36;

    sheet.sections.forEach((sec, idx) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Section Title
      doc.setFontSize(11);
      doc.setTextColor(14, 116, 144);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${sec.title}`, 14, y);
      y += 5;

      // Code Box
      const splitLines = doc.splitTextToSize(sec.content, pageWidth - 32);
      const boxHeight = (splitLines.length * 4.2) + 6;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, pageWidth - 28, boxHeight, 2, 2, 'FD');

      doc.setFont('courier', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(splitLines, 17, y + 4.5);

      y += boxHeight + 8;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated by Elevora AI — Developer Platform & Coding Companion', 14, 288);

    doc.save(`${sheet.id}_cheatsheet_elevora.pdf`);
    window.app?.showToast?.(`✅ ${sheet.title} PDF downloaded successfully!`, 'success');
  }

  render() {
    if (!this.grid) return;

    // Filter uploaded PDFs
    let filteredUploaded = this.uploadedPdfs;
    if (this.searchQuery) {
      filteredUploaded = filteredUploaded.filter(p =>
        p.title.toLowerCase().includes(this.searchQuery) ||
        p.category.toLowerCase().includes(this.searchQuery) ||
        p.filename.toLowerCase().includes(this.searchQuery)
      );
    }

    // Filter built-in sheets
    let filteredSheets = cheatSheetsData;
    if (this.searchQuery) {
      filteredSheets = filteredSheets.filter(s =>
        s.title.toLowerCase().includes(this.searchQuery) ||
        s.category.toLowerCase().includes(this.searchQuery) ||
        s.description.toLowerCase().includes(this.searchQuery)
      );
    }

    let html = '';

    // Section 1: Upload Card & Uploaded PDFs (Req 4)
    html += `
      <!-- Upload New PDF Card -->
      <div id="pdf-upload-drop-zone" class="glass-card rounded-2xl p-5 border border-dashed border-cyan-500/50 bg-cyan-950/10 flex flex-col justify-between hover:border-cyan-400 transition group">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-2xl p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">📤</span>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">New Document</span>
          </div>
          <h3 class="text-base font-bold text-white group-hover:text-cyan-300 transition">Upload Cheat Sheet PDF</h3>
          <p class="text-xs text-slate-400 mt-1 leading-relaxed">
            Upload your own custom cheat sheet or notes PDF. Read in-app and download anytime!
          </p>
        </div>
        <div class="mt-4">
          <label class="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-600/30">
            <i data-lucide="upload" class="w-4 h-4"></i>
            <span>Choose PDF File</span>
            <input type="file" id="upload-pdf-file-input" class="hidden" accept=".pdf">
          </label>
        </div>
      </div>
    `;

    // Render Uploaded PDFs Cards
    filteredUploaded.forEach(pdf => {
      const sizeStr = pdf.fileSizeStr || (Math.round((pdf.fileSize || 0) / 1024) + ' KB');
      html += `
        <div class="glass-card rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 hover:border-purple-400 transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl p-2 rounded-xl bg-purple-950 text-purple-300 border border-purple-800">📄</span>
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">${pdf.category}</span>
                <button class="text-slate-500 hover:text-rose-400 p-1 rounded" onclick="window.pdfLibrary.deleteUploadedPdf('${pdf.id}')" title="Delete">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
            <h3 class="text-sm font-bold text-white mb-1 line-clamp-1">${pdf.title}</h3>
            <p class="text-[11px] font-mono text-slate-400">${pdf.filename} • ${sizeStr}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
            <button class="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition" onclick="window.pdfLibrary.readUploadedPdf('${pdf.id}')">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>Read</span>
            </button>
            <button class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition" onclick="window.pdfLibrary.downloadUploadedPdf('${pdf.id}')">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>Download</span>
            </button>
          </div>
        </div>
      `;
    });

    // Render Built-in Core Cheat Sheets
    filteredSheets.forEach(sheet => {
      html += `
        <div class="glass-card rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-3">
              <span class="text-2xl p-2 rounded-xl bg-slate-900 border border-slate-800">${sheet.icon}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 border border-slate-800 font-bold">${sheet.version}</span>
            </div>
            <h3 class="text-sm font-bold text-white mb-1">${sheet.title}</h3>
            <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">${sheet.description}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
            <button class="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition" onclick="window.pdfLibrary.openReader('${sheet.id}')">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-cyan-400"></i>
              <span>Read</span>
            </button>
            <button class="py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition" onclick="window.pdfLibrary.downloadPDF(cheatSheetsData.find(s => s.id === '${sheet.id}'))">
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              <span>PDF</span>
            </button>
          </div>
        </div>
      `;
    });

    this.grid.innerHTML = html;
    lucide.createIcons();
  }
}

window.PDFLibrary = PDFLibrary;
