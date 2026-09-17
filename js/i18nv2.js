// Shared language controls, with safe storage fallback.
(() => {
  if (typeof T === 'undefined') return;
  function apply(language) {
    const lang = ['en', 'de', 'ru'].includes(language) ? language : 'en';
    try { localStorage.setItem('lang', lang); } catch { /* Storage may be unavailable. */ }
    document.documentElement.lang = lang;
    document.querySelectorAll('.lang-switch [data-lang]').forEach(button => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    for (const [attribute, html] of [['data-i18n', false], ['data-i18n-html', true]]) {
      document.querySelectorAll(`[${attribute}]`).forEach(element => {
        const key = element.getAttribute(attribute).replace(/\./g, '_');
        const value = T[lang]?.[key] ?? T.en?.[key];
        if (value !== undefined) { if (html) element.innerHTML = value; else element.textContent = value; }
      });
    }
    document.getElementById('hamburger')?.setAttribute('aria-label', ({de:'Menü öffnen',ru:'Открыть меню'})[lang] || 'Open menu');
  }
  function init() {
    document.querySelectorAll('.lang-switch').forEach(switcher => switcher.addEventListener('click', event => {
      const button = event.target.closest('button[data-lang]'); if (button) apply(button.dataset.lang);
    }));
    let lang = 'en'; try { lang = localStorage.getItem('lang') || 'en'; } catch { /* Use English. */ }
    apply(lang);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
