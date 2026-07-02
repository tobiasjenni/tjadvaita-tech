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

  if (hamburger && navList) {
    hamburger.addEventListener('click', function() {
      const isOpen = navList.classList.toggle('mobile-open');
      hamburger.classList.toggle('active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      
      // Move lang-switch into mobile overlay
      if (langSwitch) {
        if (isOpen) {
          navList.appendChild(langSwitch);
          langSwitch.style.display = 'flex';
        } else {
          document.querySelector('.nav-menu').appendChild(langSwitch);
          langSwitch.style.display = '';
        }
      }
    });

    // Close menu on link click
    navList.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navList.classList.remove('mobile-open');
        document.body.style.overflow = '';
        // Return lang-switch to nav-menu
        if (langSwitch && navList.contains(langSwitch)) {
          document.querySelector('.nav-menu').appendChild(langSwitch);
          langSwitch.style.display = '';
        }
      });
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
