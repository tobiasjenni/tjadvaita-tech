// One accessible navigation surface for the website and live practice shells.
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const update = () => navbar.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', update, {passive:true}); update();
  }
  const toggle = document.getElementById('hamburger');
  const menu = document.getElementById('navList') || document.getElementById('navLinks');
  if (toggle && menu) {
    const copy = {
      en:{title:'Find your practice.',label:'EXPLORE TJ ADVAITA',close:'Close menu',read:'Sanskrit, wisdom & commentary',sit:'A little stillness, every day',play:'The game of self-inquiry',language:'LANGUAGE'},
      de:{title:'Dein Raum für Praxis.',label:'TJ ADVAITA ENTDECKEN',close:'Menü schließen',read:'Sanskrit, Weisheit & Kommentare',sit:'Ein wenig Stille, jeden Tag',play:'Das Spiel der Selbsterkenntnis',language:'SPRACHE'},
      ru:{title:'Время для практики.',label:'ОТКРОЙТЕ TJ ADVAITA',close:'Закрыть меню',read:'Санскрит, мудрость и комментарии',sit:'Немного тишины каждый день',play:'Игра самопознания',language:'ЯЗЫК'}
    };
    const dialog = document.createElement('dialog');
    dialog.className = 'site-menu'; dialog.setAttribute('aria-labelledby','site-menu-title');
    dialog.innerHTML = '<div class="menu-top"><a class="menu-brand" href="/">✳ <span>TJ Advaita</span></a><button class="menu-close" type="button"><span aria-hidden="true">×</span></button></div><div class="menu-intro"><p></p><h2 id="site-menu-title"></h2></div><div class="menu-body"></div><div class="menu-language"><p></p></div>';
    document.body.append(dialog);
    const close = dialog.querySelector('.menu-close');
    const languages = document.querySelector('.lang-switch');
    const menuMarker = document.createComment('website menu'); menu.before(menuMarker);
    const langMarker = document.createComment('language controls'); languages?.before(langMarker);
    const menuNodes = [...menu.childNodes];
    menu.classList.add('menu-links');
    for (const link of menu.querySelectorAll('a')) {
      const destination = new URL(link.href,location.href);
      if (destination.origin !== location.origin) continue;
      const pathname = destination.pathname;
      const practice = pathname === '/yoga-sutras/' ? 'read' : pathname === '/daily-mantra/' ? 'sit' : pathname === '/lila/' ? 'play' : '';
      if (practice) {
        link.dataset.practiceLink = practice;
        (menu.tagName === 'UL' ? link.closest('li') : link).classList.add('menu-practice');
        if (pathname === location.pathname) link.setAttribute('aria-current','page');
      }
    }
    function labels() {
      const text = copy[document.documentElement.lang] || copy.en;
      dialog.querySelector('.menu-intro p').textContent = text.label;
      dialog.querySelector('h2').textContent = text.title;
      close.setAttribute('aria-label',text.close);
      dialog.querySelector('.menu-language p').textContent = text.language;
      menu.querySelectorAll('[data-practice-link]').forEach(link => link.dataset.caption = text[link.dataset.practiceLink]);
    }
    let oldOverflow = '';
    function finishClose() {
      menuMarker.after(menu);
      menu.replaceChildren(...menuNodes);
      if (languages) langMarker.after(languages);
      document.body.style.overflow = oldOverflow;
      toggle.setAttribute('aria-expanded','false');
      toggle.focus({preventScroll:true});
    }
    toggle.addEventListener('click', () => {
      if (dialog.open) { dialog.close(); return; }
      labels(); oldOverflow = document.body.style.overflow;
      menu.prepend(...menu.querySelectorAll('.menu-practice'));
      dialog.querySelector('.menu-body').append(menu);
      const languagePanel = dialog.querySelector('.menu-language');
      languagePanel.hidden = !languages;
      if (languages) languagePanel.append(languages);
      dialog.showModal(); dialog.scrollTop = 0;
      document.body.style.overflow = 'hidden'; toggle.setAttribute('aria-expanded','true');
      close.focus({preventScroll:true});
    });
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', finishClose);
    dialog.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link) {
        if (link.getAttribute('aria-current') === 'page') event.preventDefault();
        dialog.close();
      }
      else if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
      }
    });
    new MutationObserver(labels).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    window.matchMedia('(max-width: 1280px)').addEventListener('change', event => {
      if (!event.matches && dialog.open && !document.body.classList.contains('practice-shell')) dialog.close();
    });
  }
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('reveal-pending'); observer.unobserve(entry.target); }
    }), {threshold:0.05});
    document.querySelectorAll('.reveal').forEach(element => {
      if (element.getBoundingClientRect().top > window.innerHeight) { element.classList.add('reveal-pending'); observer.observe(element); }
    });
  }
});
