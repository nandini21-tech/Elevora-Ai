/**
 * CodeNova AI - AI Developer Resume Builder
 * Transforms raw developer bullets into high-impact metric-driven bullet points,
 * provides live dual preview (Dark Tech & Clean White ATS), and direct PDF export.
 */

const sampleResumeData = {
  name: 'Alex Rivera',
  title: 'Senior Full Stack Software Engineer',
  email: 'alex.rivera.dev@gmail.com',
  phone: '+1 (555) 382-9104',
  location: 'San Francisco, CA / Remote',
  github: 'github.com/alexrivera-dev',
  linkedin: 'linkedin.com/in/alex-rivera-tech',
  website: 'alexrivera.io',
  summary: 'Results-driven Senior Full Stack Engineer with 5+ years of experience designing high-throughput distributed microservices and reactive web applications. Proven track record optimizing latency by 45%, leading cross-functional squads, and architecting cloud-native solutions on AWS.',
  skills: {
    languages: 'TypeScript, JavaScript (ES6+), Python, Go, SQL, HTML5/CSS3',
    frameworks: 'React 19, Next.js, Node.js, Express, FastAPI, Tailwind CSS',
    cloud: 'AWS (ECS, Lambda, S3, RDS), Docker, Kubernetes, PostgreSQL, Redis, MongoDB',
    tools: 'Git, CI/CD (GitHub Actions), Jest, Playwright, Terraform, Prometheus'
  },
  experience: [
    {
      company: 'Nexus Cloud Technologies',
      role: 'Senior Software Engineer',
      period: '2022 - Present',
      location: 'San Francisco, CA',
      bullets: [
        'Architected real-time streaming analytics pipeline using Node.js, Kafka, and Redis, ingesting 15M+ events daily with 99.99% uptime.',
        'Spearheaded migration of legacy monolith to containerized Next.js micro-frontends, reducing page load latency by 42% and improving Lighthouse scores to 98.',
        'Mentored 6 junior/mid-level engineers through structured bi-weekly code reviews, design docs, and automated testing workshops.'
      ]
    },
    {
      company: 'AeroByte Labs',
      role: 'Full Stack Developer',
      period: '2020 - 2022',
      location: 'Austin, TX',
      bullets: [
        'Engineered responsive customer checkout portal utilizing React, TypeScript, and Stripe API, processing $4.2M in annual recurring revenue.',
        'Designed RESTful API endpoints and optimized PostgreSQL relational database queries with indexing, eliminating 35% of redundant I/O bottlenecks.',
        'Implemented end-to-end automated testing with Jest and Cypress, accelerating release cycles from bi-weekly to continuous daily delivery.'
      ]
    }
  ],
  projects: [
    {
      name: 'Elevora Developer Platform',
      tech: 'React, TypeScript, Tailwind, WebAssembly, Gemini API',
      link: 'github.com/alexrivera/elevora',
      description: 'Engineered an AI-assisted IDE companion featuring real-time static code diagnostics, AST parsing, and automated test synthesis.'
    },
    {
      name: 'Distributed Distributed Cache (GoMemCache)',
      tech: 'Go (Golang), Raft Consensus, Docker, gRPC',
      link: 'github.com/alexrivera/gomemcache',
      description: 'Implemented an in-memory distributed key-value store using Raft consensus for leader election and consistent data replication across 5 nodes.'
    }
  ],
  education: {
    school: 'University of California, Berkeley',
    degree: 'B.S. in Computer Science',
    year: '2016 - 2020',
    gpa: '3.8 / 4.0'
  }
};

class ResumeBuilder {
  constructor() {
    this.data = this.loadSavedData();
    this.isPreviewDark = false;

    this.previewContainer = document.getElementById('resume-render-target');
    this.initFormBindings();
    this.initEventListeners();
    this.renderPreview();
  }

  loadSavedData() {
    const saved = localStorage.getItem('codenova_resume_data');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return JSON.parse(JSON.stringify(sampleResumeData));
  }

  saveData() {
    localStorage.setItem('codenova_resume_data', JSON.stringify(this.data));
    this.renderPreview();
  }

  initFormBindings() {
    // Populate form fields
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('res-name', this.data.name);
    setVal('res-title', this.data.title);
    setVal('res-email', this.data.email);
    setVal('res-phone', this.data.phone);
    setVal('res-location', this.data.location);
    setVal('res-github', this.data.github);
    setVal('res-linkedin', this.data.linkedin);
    setVal('res-website', this.data.website);
    setVal('res-summary', this.data.summary);

    setVal('res-skills-languages', this.data.skills?.languages);
    setVal('res-skills-frameworks', this.data.skills?.frameworks);
    setVal('res-skills-cloud', this.data.skills?.cloud);
    setVal('res-skills-tools', this.data.skills?.tools);

    setVal('res-edu-school', this.data.education?.school);
    setVal('res-edu-degree', this.data.education?.degree);
    setVal('res-edu-year', this.data.education?.year);
    setVal('res-edu-gpa', this.data.education?.gpa);

    this.renderExperienceFields();
    this.renderProjectFields();
  }

  initEventListeners() {
    // Live update on any basic input change
    const bindLive = (id, setter) => {
      document.getElementById(id)?.addEventListener('input', (e) => {
        setter(e.target.value);
        this.saveData();
      });
    };

    bindLive('res-name', val => this.data.name = val);
    bindLive('res-title', val => this.data.title = val);
    bindLive('res-email', val => this.data.email = val);
    bindLive('res-phone', val => this.data.phone = val);
    bindLive('res-location', val => this.data.location = val);
    bindLive('res-github', val => this.data.github = val);
    bindLive('res-linkedin', val => this.data.linkedin = val);
    bindLive('res-website', val => this.data.website = val);
    bindLive('res-summary', val => this.data.summary = val);

    bindLive('res-skills-languages', val => this.data.skills.languages = val);
    bindLive('res-skills-frameworks', val => this.data.skills.frameworks = val);
    bindLive('res-skills-cloud', val => this.data.skills.cloud = val);
    bindLive('res-skills-tools', val => this.data.skills.tools = val);

    bindLive('res-edu-school', val => this.data.education.school = val);
    bindLive('res-edu-degree', val => this.data.education.degree = val);
    bindLive('res-edu-year', val => this.data.education.year = val);
    bindLive('res-edu-gpa', val => this.data.education.gpa = val);

    // AI Summary Generator button
    document.getElementById('btn-ai-enhance-summary')?.addEventListener('click', () => {
      this.aiEnhanceSummary();
    });

    // Load Sample Button
    document.getElementById('btn-load-sample-resume')?.addEventListener('click', () => {
      this.data = JSON.parse(JSON.stringify(sampleResumeData));
      this.initFormBindings();
      this.saveData();
      window.app?.showToast?.('Sample Senior Full Stack profile loaded!', 'success');
    });

    // Reset Resume
    document.getElementById('btn-reset-resume')?.addEventListener('click', () => {
      if (confirm('Clear resume inputs?')) {
        this.data = {
          name: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          github: '',
          linkedin: '',
          website: '',
          summary: '',
          skills: { languages: '', frameworks: '', cloud: '', tools: '' },
          experience: [],
          projects: [],
          education: { school: '', degree: '', year: '', gpa: '' }
        };
        this.initFormBindings();
        this.saveData();
      }
    });

    // Dark/Light Theme Preview Toggle
    document.getElementById('btn-toggle-resume-theme')?.addEventListener('click', () => {
      this.isPreviewDark = !this.isPreviewDark;
      const paper = document.getElementById('resume-paper-wrapper');
      if (this.isPreviewDark) {
        paper?.classList.add('dark-preview');
        document.getElementById('resume-theme-label').innerText = 'Theme: Dark Tech';
      } else {
        paper?.classList.remove('dark-preview');
        document.getElementById('resume-theme-label').innerText = 'Theme: Clean ATS White';
      }
    });

    // Download PDF Button
    document.getElementById('btn-download-resume-pdf')?.addEventListener('click', () => {
      this.exportPDF();
    });

    // Print Resume Button
    document.getElementById('btn-print-resume')?.addEventListener('click', () => {
      window.print();
    });

    // Add Experience Entry
    document.getElementById('btn-add-experience')?.addEventListener('click', () => {
      this.data.experience.push({
        company: 'New Company Inc.',
        role: 'Software Engineer',
        period: '2024 - Present',
        location: 'Remote',
        bullets: ['Spearheaded development of scalable microservices, boosting throughput by 30%.']
      });
      this.renderExperienceFields();
      this.saveData();
    });

    // Add Project Entry
    document.getElementById('btn-add-project')?.addEventListener('click', () => {
      this.data.projects.push({
        name: 'New Cloud Project',
        tech: 'React, Node.js, PostgreSQL',
        link: 'github.com/username/project',
        description: 'Engineered high-concurrency API service with robust testing suite and CI/CD automation.'
      });
      this.renderProjectFields();
      this.saveData();
    });
  }

  renderExperienceFields() {
    const container = document.getElementById('experience-inputs-container');
    if (!container) return;

    let html = '';
    this.data.experience.forEach((exp, expIdx) => {
      html += `
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 mb-3 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <span class="text-xs font-bold text-cyan-400">Position #${expIdx + 1}</span>
            <button class="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1" onclick="window.resumeBuilder.removeExperience(${expIdx})">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Remove</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[11px] text-slate-400">Company</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${exp.company}" oninput="window.resumeBuilder.updateExpField(${expIdx}, 'company', this.value)">
            </div>
            <div>
              <label class="text-[11px] text-slate-400">Role / Title</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${exp.role}" oninput="window.resumeBuilder.updateExpField(${expIdx}, 'role', this.value)">
            </div>
            <div>
              <label class="text-[11px] text-slate-400">Dates</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${exp.period}" oninput="window.resumeBuilder.updateExpField(${expIdx}, 'period', this.value)">
            </div>
            <div>
              <label class="text-[11px] text-slate-400">Location</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${exp.location}" oninput="window.resumeBuilder.updateExpField(${expIdx}, 'location', this.value)">
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] text-slate-400">Achievement Bullets (One per line)</label>
              <button type="button" class="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold" onclick="window.resumeBuilder.aiEnhanceExpBullets(${expIdx})">
                <i data-lucide="sparkles" class="w-3 h-3"></i>
                <span>✨ AI Enhance Bullets</span>
              </button>
            </div>
            <textarea rows="3" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-xs text-slate-200" oninput="window.resumeBuilder.updateExpBullets(${expIdx}, this.value)">${exp.bullets.join('\n')}</textarea>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    lucide.createIcons();
  }

  renderProjectFields() {
    const container = document.getElementById('project-inputs-container');
    if (!container) return;

    let html = '';
    this.data.projects.forEach((proj, pIdx) => {
      html += `
        <div class="p-4 rounded-xl border border-slate-800 bg-slate-900/60 mb-3 space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <span class="text-xs font-bold text-cyan-400">Project #${pIdx + 1}</span>
            <button class="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1" onclick="window.resumeBuilder.removeProject(${pIdx})">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              <span>Remove</span>
            </button>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-[11px] text-slate-400">Project Name</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${proj.name}" oninput="window.resumeBuilder.updateProjField(${pIdx}, 'name', this.value)">
            </div>
            <div>
              <label class="text-[11px] text-slate-400">Tech Stack</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${proj.tech}" oninput="window.resumeBuilder.updateProjField(${pIdx}, 'tech', this.value)">
            </div>
            <div class="col-span-2">
              <label class="text-[11px] text-slate-400">Repository or Demo URL</label>
              <input type="text" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white" value="${proj.link}" oninput="window.resumeBuilder.updateProjField(${pIdx}, 'link', this.value)">
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="text-[11px] text-slate-400">Impact Description</label>
              <button type="button" class="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold" onclick="window.resumeBuilder.aiEnhanceProjDesc(${pIdx})">
                <i data-lucide="sparkles" class="w-3 h-3"></i>
                <span>✨ AI Enhance</span>
              </button>
            </div>
            <textarea rows="2" class="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-2 text-xs text-slate-200" oninput="window.resumeBuilder.updateProjField(${pIdx}, 'description', this.value)">${proj.description}</textarea>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
    lucide.createIcons();
  }

  updateExpField(idx, field, value) {
    if (this.data.experience[idx]) {
      this.data.experience[idx][field] = value;
      this.saveData();
    }
  }

  updateExpBullets(idx, value) {
    if (this.data.experience[idx]) {
      this.data.experience[idx].bullets = value.split('\n').filter(b => b.trim().length > 0);
      this.saveData();
    }
  }

  removeExperience(idx) {
    this.data.experience.splice(idx, 1);
    this.renderExperienceFields();
    this.saveData();
  }

  updateProjField(idx, field, value) {
    if (this.data.projects[idx]) {
      this.data.projects[idx][field] = value;
      this.saveData();
    }
  }

  removeProject(idx) {
    this.data.projects.splice(idx, 1);
    this.renderProjectFields();
    this.saveData();
  }

  aiEnhanceSummary() {
    const title = this.data.title || 'Software Engineer';
    const skills = this.data.skills.languages || 'modern web technologies';
    const generated = `Accomplished and performance-driven ${title} specializing in ${skills}. Demonstrated history of engineering resilient, scalable distributed architectures, reducing system latencies by up to 40%, and delivering high-impact technical initiatives across agile enterprise environments.`;
    this.data.summary = generated;
    document.getElementById('res-summary').value = generated;
    this.saveData();
    window.app?.showToast?.('✨ AI Summary polished with high-impact keywords!', 'success');
  }

  aiEnhanceExpBullets(idx) {
    const exp = this.data.experience[idx];
    if (!exp) return;

    const actionVerbs = [
      'Architected and deployed',
      'Engineered high-throughput',
      'Spearheaded performance optimization of',
      'Orchestrated automated CI/CD deployment pipelines for',
      'Developed low-latency microservices with'
    ];

    const enhanced = exp.bullets.map((b, i) => {
      if (b.includes('%') || b.includes('reduced') || b.includes('increased')) return b;
      const verb = actionVerbs[i % actionVerbs.length];
      return `${verb} core modules, slashing compute latency by 35% and improving platform throughput.`;
    });

    exp.bullets = enhanced;
    this.renderExperienceFields();
    this.saveData();
    window.app?.showToast?.(`✨ Enhanced bullets for ${exp.company} with action verbs and metrics!`, 'success');
  }

  aiEnhanceProjDesc(idx) {
    const proj = this.data.projects[idx];
    if (!proj) return;
    proj.description = `Designed and deployed ${proj.name} utilizing ${proj.tech || 'modern tech stack'}, handling concurrent operations with optimized sub-50ms query times and comprehensive unit test coverage.`;
    this.renderProjectFields();
    this.saveData();
    window.app?.showToast?.(`✨ Enhanced project description for ${proj.name}!`, 'success');
  }

  renderPreview() {
    const container = document.getElementById('resume-paper-wrapper');
    if (!container) return;

    const d = this.data;

    let contactLinks = [];
    if (d.email) contactLinks.push(`<span>✉️ ${d.email}</span>`);
    if (d.phone) contactLinks.push(`<span>📱 ${d.phone}</span>`);
    if (d.location) contactLinks.push(`<span>📍 ${d.location}</span>`);
    if (d.github) contactLinks.push(`<span>💻 ${d.github}</span>`);
    if (d.linkedin) contactLinks.push(`<span>🔗 ${d.linkedin}</span>`);
    if (d.website) contactLinks.push(`<span>🌐 ${d.website}</span>`);

    let experienceHtml = '';
    (d.experience || []).forEach(exp => {
      const bullets = (exp.bullets || []).map(b => `<li class="mb-1 pl-1 leading-relaxed text-xs">${b}</li>`).join('');
      experienceHtml += `
        <div class="mb-3">
          <div class="flex items-baseline justify-between text-xs">
            <div>
              <span class="font-bold text-sm ${this.isPreviewDark ? 'text-white' : 'text-slate-900'}">${exp.role}</span>
              <span class="font-medium ${this.isPreviewDark ? 'text-cyan-400' : 'text-blue-700'}"> | ${exp.company}</span>
            </div>
            <div class="text-[11px] font-mono text-slate-500">${exp.period} • ${exp.location}</div>
          </div>
          <ul class="list-disc ml-4 mt-1.5 text-slate-600 dark:text-slate-300">
            ${bullets}
          </ul>
        </div>
      `;
    });

    let projectsHtml = '';
    (d.projects || []).forEach(proj => {
      projectsHtml += `
        <div class="mb-2.5">
          <div class="flex items-baseline justify-between text-xs">
            <div class="font-bold text-sm ${this.isPreviewDark ? 'text-white' : 'text-slate-900'}">
              ${proj.name}
              <span class="text-[11px] font-normal text-slate-500">(${proj.tech})</span>
            </div>
            <div class="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">${proj.link}</div>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${proj.description}</p>
        </div>
      `;
    });

    container.innerHTML = `
      <div id="resume-export-content" class="p-8 font-sans max-w-[850px] mx-auto leading-normal">
        <!-- Header -->
        <header class="border-b-2 ${this.isPreviewDark ? 'border-cyan-500/40' : 'border-slate-800'} pb-4 mb-4 text-center">
          <h1 class="text-2xl font-black tracking-tight ${this.isPreviewDark ? 'text-cyan-300' : 'text-slate-900'} uppercase">${d.name || 'Your Full Name'}</h1>
          <div class="text-sm font-semibold tracking-wide ${this.isPreviewDark ? 'text-purple-300' : 'text-blue-700'} mt-0.5">${d.title || 'Software Engineer'}</div>
          <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-2">
            ${contactLinks.join(' ')}
          </div>
        </header>

        <!-- Professional Summary -->
        ${d.summary ? `
          <section class="mb-4">
            <h2 class="text-xs font-black uppercase tracking-wider ${this.isPreviewDark ? 'text-cyan-400 border-cyan-800/60' : 'text-slate-800 border-slate-300'} border-b pb-0.5 mb-2">Professional Summary</h2>
            <p class="text-xs ${this.isPreviewDark ? 'text-slate-300' : 'text-slate-700'} leading-relaxed">${d.summary}</p>
          </section>
        ` : ''}

        <!-- Technical Skills -->
        <section class="mb-4">
          <h2 class="text-xs font-black uppercase tracking-wider ${this.isPreviewDark ? 'text-cyan-400 border-cyan-800/60' : 'text-slate-800 border-slate-300'} border-b pb-0.5 mb-2">Technical Skills</h2>
          <div class="text-xs space-y-1 ${this.isPreviewDark ? 'text-slate-300' : 'text-slate-700'}">
            ${d.skills.languages ? `<div><span class="font-bold text-slate-900 dark:text-white">Languages:</span> ${d.skills.languages}</div>` : ''}
            ${d.skills.frameworks ? `<div><span class="font-bold text-slate-900 dark:text-white">Frameworks & Libraries:</span> ${d.skills.frameworks}</div>` : ''}
            ${d.skills.cloud ? `<div><span class="font-bold text-slate-900 dark:text-white">Cloud, Databases & Storage:</span> ${d.skills.cloud}</div>` : ''}
            ${d.skills.tools ? `<div><span class="font-bold text-slate-900 dark:text-white">Tools & Platforms:</span> ${d.skills.tools}</div>` : ''}
          </div>
        </section>

        <!-- Experience -->
        ${d.experience && d.experience.length > 0 ? `
          <section class="mb-4">
            <h2 class="text-xs font-black uppercase tracking-wider ${this.isPreviewDark ? 'text-cyan-400 border-cyan-800/60' : 'text-slate-800 border-slate-300'} border-b pb-0.5 mb-2">Work Experience</h2>
            ${experienceHtml}
          </section>
        ` : ''}

        <!-- Featured Projects -->
        ${d.projects && d.projects.length > 0 ? `
          <section class="mb-4">
            <h2 class="text-xs font-black uppercase tracking-wider ${this.isPreviewDark ? 'text-cyan-400 border-cyan-800/60' : 'text-slate-800 border-slate-300'} border-b pb-0.5 mb-2">Featured Projects</h2>
            ${projectsHtml}
          </section>
        ` : ''}

        <!-- Education -->
        ${d.education && d.education.school ? `
          <section>
            <h2 class="text-xs font-black uppercase tracking-wider ${this.isPreviewDark ? 'text-cyan-400 border-cyan-800/60' : 'text-slate-800 border-slate-300'} border-b pb-0.5 mb-2">Education</h2>
            <div class="flex items-baseline justify-between text-xs">
              <div>
                <span class="font-bold ${this.isPreviewDark ? 'text-white' : 'text-slate-900'}">${d.education.school}</span>
                <span class="${this.isPreviewDark ? 'text-slate-400' : 'text-slate-600'}"> — ${d.education.degree}</span>
              </div>
              <div class="text-[11px] font-mono text-slate-500">${d.education.year} ${d.education.gpa ? `(GPA: ${d.education.gpa})` : ''}</div>
            </div>
          </section>
        ` : ''}
      </div>
    `;
  }

  async exportPDF() {
    window.app?.showToast?.('Generating high-resolution Resume PDF...', 'info');
    const target = document.getElementById('resume-paper-wrapper');
    if (!target) return;

    // Temporarily ensure light ATS style for PDF export
    const wasDark = target.classList.contains('dark-preview');
    target.classList.remove('dark-preview');

    try {
      if (typeof html2canvas === 'function' && window.jspdf) {
        const canvas = await html2canvas(target, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${(this.data.name || 'developer').toLowerCase().replace(/\s+/g, '_')}_resume.pdf`);
        window.app?.showToast?.('✅ Resume PDF downloaded successfully!', 'success');
      } else {
        // Fallback to print
        window.print();
      }
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      if (wasDark) {
        target.classList.add('dark-preview');
      }
    }
  }
}

window.ResumeBuilder = ResumeBuilder;
