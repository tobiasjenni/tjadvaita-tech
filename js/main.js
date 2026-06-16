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

  if (hamburger && navList) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navList.classList.toggle('mobile-open');
      document.body.style.overflow = navList.classList.contains('mobile-open') ? 'hidden' : '';
    });

    // Close menu on link click
    navList.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navList.classList.remove('mobile-open');
        document.body.style.overflow = '';
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
