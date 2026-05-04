/**
 * main.js — Language toggle, Markdown rendering, PDF export
 *
 * Content files:
 *   content/en.md  — English CV  (edit freely)
 *   content/zh.md  — Chinese CV  (edit freely)
 *
 * The active language is persisted to localStorage under the key "lang".
 */

(function () {
  'use strict';

  /* ── State ──────────────────────────────────────────────────── */
  let currentLang = localStorage.getItem('lang') || 'en';

  /* ── DOM refs ────────────────────────────────────────────────── */
  const resumeEl   = document.getElementById('resume');
  const langToggle = document.getElementById('lang-toggle');
  const pdfBtn     = document.getElementById('pdf-btn');

  /* ── Marked.js renderer config ──────────────────────────────── */
  marked.use({
    gfm: true,
    breaks: false,
    pedantic: false,
    // Sanitize is deprecated; content is author-controlled, so this is fine.
  });

  /* ── Fetch + render a markdown file ─────────────────────────── */
  async function loadResume(lang) {
    resumeEl.innerHTML =
      '<div class="resume__loading">' +
        '<span class="resume__loading-dot"></span>' +
        '<span class="resume__loading-dot"></span>' +
        '<span class="resume__loading-dot"></span>' +
      '</div>';

    try {
      const url      = 'content/' + lang + '.md';
      const response = await fetch(url);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const markdown = await response.text();
      const html     = marked.parse(markdown);
      resumeEl.innerHTML = html;
      postProcess(resumeEl, lang);
    } catch (err) {
      console.error('[resume] Failed to load content:', err);
      resumeEl.innerHTML =
        '<p class="resume__error">⚠ Content could not be loaded. ' +
        'Please ensure the <code>content/' + lang + '.md</code> file exists ' +
        'and the page is served over HTTP (not opened as a local file).</p>';
    }
  }

  /* ── Post-process rendered HTML ─────────────────────────────── */
  function postProcess(container, lang) {
    // Tag the first <p> after <h1> as contact info
    const h1 = container.querySelector('h1');
    if (h1) {
      const next = h1.nextElementSibling;
      if (next && next.tagName === 'P') {
        next.classList.add('contact-info');
      }
    }
  }

  /* ── Apply language ──────────────────────────────────────────── */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update <html> lang attribute
    document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'zh-CN');

    // Update page title
    document.title = lang === 'en'
      ? 'Weijie Chen — Personal Homepage'
      : '陈维杰 — 个人主页';

    // Update toggle button label (show the *other* language)
    langToggle.querySelector('span').textContent = lang === 'en' ? '中文' : 'English';

    // Load content
    loadResume(lang);
  }

  /* ── Language toggle handler ─────────────────────────────────── */
  langToggle.addEventListener('click', function () {
    applyLang(currentLang === 'en' ? 'zh' : 'en');
  });

  /* ── PDF export handler ──────────────────────────────────────── */
  pdfBtn.addEventListener('click', function () {
    window.print();
  });

  /* ── Initialise ──────────────────────────────────────────────── */
  applyLang(currentLang);

})();
