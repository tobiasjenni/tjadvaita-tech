// ── I18N ENGINE ──
(function(){
  if (typeof T === 'undefined') return;

  let currentLang = localStorage.getItem('lang') || 'en';

  function apply(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);

    // Update lang switcher buttons
    document.querySelectorAll('#lang-switch button').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    // Named i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const t = T[lang] && T[lang][key];
      if (t !== undefined) el.textContent = t;
    });

    // HTML-safe i18n (preserves child elements like <em>, <a>)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      const t = T[lang] && T[lang][key];
      if (t !== undefined) el.innerHTML = t;
    });

    // Update document lang
    document.documentElement.lang = lang === 'ru' ? 'ru' : lang === 'de' ? 'de' : 'en';
  }

  // Click handler
  document.getElementById('lang-switch').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn || !btn.dataset.lang) return;
    apply(btn.dataset.lang);
  });

  // Apply saved or default language
  apply(currentLang);
})();
