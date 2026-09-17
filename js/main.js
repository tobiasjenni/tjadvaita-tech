// Shared navigation for the homepage and both profiles.
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const update = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', update, {passive: true});
    update();
  }
  const toggle = document.getElementById('hamburger');
  const menu = document.getElementById('navList') || document.getElementById('navLinks');
  const languages = document.querySelector('.lang-switch');
  if (toggle && menu) {
    const mobile = window.matchMedia('(max-width: 1280px)');
    const marker = document.createComment('language switch position');
    languages?.before(marker);
    const close = document.createElement('button');
    close.type = 'button'; close.className = 'mobile-close'; close.textContent = '×';
    const closeItem = document.createElement(menu.tagName === 'UL' ? 'li' : 'div');
    closeItem.append(close);
    const languageItem = document.createElement(menu.tagName === 'UL' ? 'li' : 'div');
    const background = [...document.querySelectorAll('main, body > footer, .nav-logo')];
    let priorInert = [], oldOverflow = '';
    toggle.setAttribute('aria-controls', menu.id);
    toggle.setAttribute('aria-expanded', 'false');
    function closeMenu(restoreFocus = true) {
      if (!menu.classList.contains('mobile-open')) return;
      menu.classList.remove('mobile-open'); toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open'); document.body.style.overflow = oldOverflow;
      priorInert.forEach(([element, inert]) => element.inert = inert);
      if (languages && languageItem.contains(languages)) marker.after(languages);
      closeItem.remove(); languageItem.remove();
      if (restoreFocus) toggle.focus();
    }
    function openMenu() {
      if (!mobile.matches) return;
      oldOverflow = document.body.style.overflow;
      priorInert = background.map(element => [element, element.inert]);
      background.forEach(element => element.inert = true);
      close.setAttribute('aria-label', ({de:'Menü schließen',ru:'Закрыть меню'})[document.documentElement.lang] || 'Close menu');
      menu.prepend(closeItem);
      if (languages && !menu.contains(languages)) { languageItem.append(languages); menu.append(languageItem); }
      menu.classList.add('mobile-open'); toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open'); document.body.style.overflow = 'hidden';
      close.focus();
    }
    toggle.addEventListener('click', () => menu.classList.contains('mobile-open') ? closeMenu() : openMenu());
    close.addEventListener('click', () => closeMenu());
    menu.addEventListener('click', event => {
      if (event.target === menu || event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', event => {
      if (!menu.classList.contains('mobile-open')) return;
      if (event.key === 'Escape') { event.preventDefault(); closeMenu(); }
      if (event.key === 'Tab') {
        const items = [...menu.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    mobile.addEventListener('change', () => { if (!mobile.matches) closeMenu(false); });
  }
  // Reading and anchor navigation work even when scripting is unavailable.
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); observer.unobserve(entry.target); }
    }), {threshold: 0.05});
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) {
        element.classList.add('reveal-pending'); observer.observe(element);
      }
    });
  }
});

