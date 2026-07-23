/* ================================================================
   EcoTrack - AI Carbon Footprint Calculator
   Main JavaScript Logic
   Author: Senior Developer & Architect
   Version: 1.0.0
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Loader
  initLoader();

  // 2. Initialize Navigation & Mobile Menu
  initNavigation();

  // 3. Initialize Theme Toggle (Dark / Light Mode)
  initTheme();

  // 4. Initialize Scroll Revelations & Animations
  initScrollAnimations();

  // 5. Initialize Count-up Statistics
  initCounterAnimations();

  // 6. Initialize Hero Particle Effects
  initHeroParticles();

  // 7. Initialize FAQ Accordion
  initFaqAccordion();

  // 8. Contact Form Handling
  initContactForm();

  // 9. Toast Notification System
  initToastSystem();

  // 10. Typewriter Effect
  initTypewriter();
});

/* ----------------------------------------------------------------
   1. PAGE LOADER
---------------------------------------------------------------- */
function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    // Add small delay to ensure rendering completes smoothly
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        document.body.style.overflowY = 'auto';
      }, 800);
    });
  }
}

/* ----------------------------------------------------------------
   2. NAVIGATION & MOBILE MENU
---------------------------------------------------------------- */
function initNavigation() {
  const navbar = document.querySelector('.navbar-custom');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const navLinks = document.querySelectorAll('.nav-link-custom, .mobile-nav .nav-link-custom');
  const scrollTopBtn = document.querySelector('.scroll-top-btn');

  // Sticky / Scrolled Navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
      if (scrollTopBtn) scrollTopBtn.classList.add('show');
    } else {
      navbar.classList.remove('scrolled');
      if (scrollTopBtn) scrollTopBtn.classList.remove('show');
    }

    // Update active state of links based on section positions
    updateActiveNavLink();
  });

  // Mobile Menu Toggle
  if (mobileMenuBtn && mobileNav && mobileNavOverlay) {
    const toggleMenu = () => {
      const isOpen = mobileNav.classList.contains('open');
      if (isOpen) {
        mobileNav.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileNavOverlay.classList.remove('show');
        document.body.style.overflowY = 'auto';
      } else {
        mobileNav.classList.add('open');
        mobileMenuBtn.classList.add('active');
        mobileNavOverlay.classList.add('show');
        document.body.style.overflowY = 'hidden';
      }
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);
    mobileNavOverlay.addEventListener('click', toggleMenu);

    // Close menu when clicking links
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        mobileMenuBtn.classList.remove('active');
        mobileNavOverlay.classList.remove('show');
        document.body.style.overflowY = 'auto';
      });
    });
  }

  // Scroll to Top action
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Highlight active section on scroll
  function updateActiveNavLink() {
    let fromTop = window.scrollY + 120;

    navLinks.forEach(link => {
      const sectionId = link.getAttribute('href');
      if (sectionId && sectionId.startsWith('#')) {
        const section = document.querySelector(sectionId);
        if (section) {
          const offsetTop = section.offsetTop;
          const offsetHeight = section.offsetHeight;

          if (fromTop >= offsetTop && fromTop < offsetTop + offsetHeight) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        }
      }
    });
  }
}

/* ----------------------------------------------------------------
   3. THEME TOGGLE (DARK/LIGHT MODE)
---------------------------------------------------------------- */
function initTheme() {
  const themeToggles = document.querySelectorAll('.theme-toggle');
  
  // Set default theme to Dark if not saved
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateToggleIcon(savedTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const currentTheme = document.body.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateToggleIcon(newTheme);

      // Trigger standard transition animation class briefly
      document.body.classList.add('theme-transition');
      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 1000);

      showToast(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
    });
  });

  function updateToggleIcon(theme) {
    themeToggles.forEach(toggle => {
      const icon = toggle.querySelector('i');
      if (icon) {
        if (theme === 'light') {
          icon.className = 'fas fa-moon';
        } else {
          icon.className = 'fas fa-sun';
        }
      }
    });
  }
}

/* ----------------------------------------------------------------
   4. SCROLL REVEAL ANIMATIONS
---------------------------------------------------------------- */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    reveals.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 100; // Trigger slightly before fully entering viewport

      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  // Run once initially to show elements already in view
  revealOnScroll();
}

/* ----------------------------------------------------------------
   5. COUNTER ANIMATIONS
---------------------------------------------------------------- */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter-value');
  const speed = 200; // Lower is faster

  const startCounter = (counter) => {
    const target = +counter.getAttribute('data-target');
    let count = 0;
    const increment = target / speed;

    const updateCount = () => {
      count += increment;
      if (count < target) {
        counter.innerText = Math.ceil(count).toLocaleString();
        setTimeout(updateCount, 1);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };
    updateCount();
  };

  // Intersection Observer to trigger when visible
  const observerOptions = {
    root: null,
    threshold: 0.2
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}

/* ----------------------------------------------------------------
   6. HERO PARTICLE EFFECTS
---------------------------------------------------------------- */
function initHeroParticles() {
  const container = document.querySelector('.particles-container');
  if (!container) return;

  const particleCount = 20;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Randomize characteristics
    const size = Math.random() * 8 + 4; // 4px to 12px
    const left = Math.random() * 100; // percentage
    const duration = Math.random() * 12 + 8; // 8s to 20s
    const delay = Math.random() * 10; // 0s to 10s

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    container.appendChild(particle);
  }
}

/* ----------------------------------------------------------------
   7. FAQ ACCORDION
---------------------------------------------------------------- */
function initFaqAccordion() {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.parentElement;
      const answer = question.nextElementSibling;
      const isOpen = item.classList.contains('open');

      // Close all other FAQs
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('open');
          otherItem.querySelector('.faq-answer').classList.remove('open');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        answer.classList.remove('open');
      } else {
        item.classList.add('open');
        answer.classList.add('open');
      }
    });
  });
}

/* ----------------------------------------------------------------
   8. CONTACT FORM HANDLING
---------------------------------------------------------------- */
function initContactForm() {
  const contactForm = document.getElementById('landingContactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Visual feedback (Loading state)
    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending message...`;

    // Simulate Server Request
    setTimeout(() => {
      showToast('Thank you! Your message has been sent successfully.', 'success');
      contactForm.reset();
      btn.disabled = false;
      btn.innerHTML = originalText;
    }, 1800);
  });
}

/* ----------------------------------------------------------------
   9. TOAST NOTIFICATION SYSTEM
---------------------------------------------------------------- */
function initToastSystem() {
  // The toast container is created on demand by showToast.
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';
  if (type === 'info') iconClass = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass}" style="color: var(--primary);"></i>
    <div class="toast-content">${message}</div>
  `;

  container.appendChild(toast);

  // Auto remove toast
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.4s ease forwards';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

// Add CSS keyframe for toast-out dynamically
const style = document.createElement('style');
style.innerHTML = `
  @keyframes toast-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(40px); }
  }
`;
document.head.appendChild(style);

// Expose toast function globally if needed
window.showToast = showToast;

/* ----------------------------------------------------------------
   10. TYPEWRITER EFFECT
---------------------------------------------------------------- */
function initTypewriter() {
  const target = document.querySelector('.typed-text');
  if (!target) return;

  const words = JSON.parse(target.getAttribute('data-words') || '[]');
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      charIndex--;
      typeSpeed = 50;
    } else {
      charIndex++;
      typeSpeed = 100;
    }

    target.innerHTML = currentWord.substring(0, charIndex);

    if (!isDeleting && charIndex === currentWord.length) {
      // Pause at the end of the word
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  // Add cursor
  const cursor = document.createElement('span');
  cursor.className = 'typed-cursor';
  target.parentNode.insertBefore(cursor, target.nextSibling);

  // Start effect
  setTimeout(type, 1000);
}
