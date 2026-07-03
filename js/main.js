// TJ Advaita — Main JS
document.addEventListener('DOMContentLoaded', function() {

  // ═══ NAV SCROLL STATE ═══
  const navbar = document.getElementById('navbar');
  let ticking = false;

  function updateNav() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateNav();

  // ═══ HAMBURGER MENU ═══
  const hamburger = document.getElementById('hamburger');
  const navList = document.getElementById('navList');
  const langSwitch = document.getElementById('langSwitchHeader');

  // Create close button for overlay
  const closeBtn = document.createElement('button');
  closeBtn.className = 'menu-close-btn';
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', 'Close menu');

  function closeMenu() {
    hamburger.classList.remove('active');
    navList.classList.remove('mobile-open');
    document.body.style.overflow = '';
    if (langSwitch && navList.contains(langSwitch)) {
      document.querySelector('.nav-menu').appendChild(langSwitch);
      langSwitch.style.display = '';
    }
    if (navList.contains(closeBtn)) {
      closeBtn.remove();
    }
  }

  function openMenu() {
    hamburger.classList.add('active');
    navList.classList.add('mobile-open');
    navList.appendChild(closeBtn);
    document.body.style.overflow = 'hidden';
    if (langSwitch) {
      navList.appendChild(langSwitch);
      langSwitch.style.display = 'flex';
    }
  }

  closeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    closeMenu();
  });

  if (hamburger && navList) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      if (navList.classList.contains('mobile-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close when tapping overlay background
    navList.addEventListener('click', function(e) {
      if (e.target === navList) {
        closeMenu();
      }
    });

    // Close on link click
    navList.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navList.classList.contains('mobile-open')) {
        closeMenu();
      }
    });
  }

  // ═══ SCROLL REVEAL (IntersectionObserver) ═══
  const revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function(el) {
    revealObserver.observe(el);
  });

  // ═══ SMOOTH SCROLL FOR ANCHORS ═══
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

});
