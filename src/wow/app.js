/* ============================================================================
   INTERACTIVE FEATURES
   ============================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // FAQ Accordion (desktop only)
  setupFaqAccordion();

  // Smooth scroll for anchor links
  setupAnchorLinks();

  // Button interactions
  setupButtonInteractions();

  // Mobile menu (hamburger) in header
  setupMobileMenu();

  // Scroll reveal (как в src/ruslan)
  setupScrollReveal();

  // Цифры чемпионата — count-up при появлении в зоне
  setupStatsCount();

  // Mobile timeline: chase light-up 01→04; only 04 stays lit
  setupTimelineLightUp();
});

/* ============================================================================
   MOBILE MENU (hamburger, шапка hero-зоны)
   ============================================================================ */

function setupMobileMenu() {
  const toggle = document.querySelector('.header__menu-toggle');
  const nav = document.getElementById('primary-nav');

  if (!toggle || !nav) {
    return;
  }

  const openMenu = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const closeMenu = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close after choosing a menu item
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Escape closes the menu and returns focus to the toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Click outside closes the menu
  document.addEventListener('click', (e) => {
    if (
      nav.classList.contains('is-open') &&
      !nav.contains(e.target) &&
      !toggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  // Resizing back to desktop closes the mobile menu
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/* ============================================================================
   FAQ ACCORDION
   ============================================================================ */

function setupFaqAccordion() {
  const toggles = document.querySelectorAll('.faq__toggle');

  const setExpanded = (toggle, expanded) => {
    const item = toggle.closest('.faq__item');
    const answer = item.querySelector('.faq__answer');
    toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    toggle.textContent = expanded ? '−' : '+';
    if (answer) {
      if (expanded) {
        answer.removeAttribute('hidden');
      } else {
        answer.setAttribute('hidden', '');
      }
    }
  };

  // Старт: всё раскрыто, знак «−»
  toggles.forEach((toggle) => setExpanded(toggle, true));

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      setExpanded(toggle, !isExpanded);
    });
  });

  document.querySelectorAll('.faq__question').forEach((question) => {
    question.style.cursor = 'pointer';
    question.addEventListener('click', () => {
      const toggle = question.closest('.faq__item').querySelector('.faq__toggle');
      if (toggle) toggle.click();
    });
  });
}

/* ============================================================================
   ANCHOR LINKS (Smooth Scroll)
   ============================================================================ */

function setupAnchorLinks() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      // Skip if it's just '#'
      if (href === '#') {
        return;
      }

      e.preventDefault();

      const targetId = href.substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        // Smooth scroll with offset for header
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.offsetTop - headerHeight;

        // Check for prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
          // Instant scroll
          window.scrollTo(0, targetPosition);
        } else {
          // Smooth scroll
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/* ============================================================================
   BUTTON INTERACTIONS
   ============================================================================ */

function setupButtonInteractions() {
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!canHover) return;

  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.02)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      button.style.transition = 'none';
    }
  });
}

/* ============================================================================
   TIMELINE LIGHT-UP — mobile scroll: 01→02→03 flash then off; 04 stays lit
   ============================================================================ */

function setupTimelineLightUp() {
  const section = document.getElementById('timeline');
  if (!section) return;

  const steps = Array.from(section.querySelectorAll('.timeline__step'));
  if (!steps.length) return;

  const mobileMq = window.matchMedia('(max-width: 767px)');
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STEP_MS = 480;
  const lastIndex = steps.length - 1;

  const lightOnly = (activeIndex) => {
    steps.forEach((step, i) => {
      step.classList.toggle('is-lit', i === activeIndex);
    });
  };

  const runSequence = () => {
    if (section.dataset.timelineLit === '1') return;
    section.dataset.timelineLit = '1';

    // Reduced motion: skip chase, leave only final step (04 / «Старт») lit
    if (reduceMq.matches) {
      lightOnly(lastIndex);
      return;
    }

    // Chase: light N, extinguish previous; only 04 remains orange
    steps.forEach((step, i) => {
      window.setTimeout(() => {
        lightOnly(i);
      }, i * STEP_MS);
    });
  };

  const startIfMobile = () => {
    if (!mobileMq.matches) return;
    if (section.dataset.timelineLit === '1') return;

    if (!('IntersectionObserver' in window)) {
      runSequence();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runSequence();
          io.disconnect();
        });
      },
      { threshold: 0.28, rootMargin: '0px 0px -12% 0px' }
    );
    io.observe(section);
  };

  startIfMobile();
  mobileMq.addEventListener('change', (e) => {
    if (e.matches) startIfMobile();
  });
}

/* ============================================================================
   STATS COUNT-UP — отсчёт до целевого числа при появлении в viewport
   ============================================================================ */

function setupStatsCount() {
  const nums = document.querySelectorAll('.stats__number[data-count]');
  if (!nums.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = 1600;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const runCount = (el) => {
    const target = Number(el.getAttribute('data-count'));
    if (!Number.isFinite(target)) return;

    if (reduce) {
      el.textContent = String(target);
      return;
    }

    const start = performance.now();
    el.textContent = '0';

    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = String(Math.round(easeOutCubic(t) * target));
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = String(target);
      }
    };

    requestAnimationFrame(frame);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(runCount);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.counted === '1') return;
        el.dataset.counted = '1';
        runCount(el);
        io.unobserve(el);
      });
    },
    { threshold: 0.35, rootMargin: '0px 0px -8% 0px' }
  );

  nums.forEach((el) => {
    if (!reduce) el.textContent = '0';
    io.observe(el);
  });
}

/* ============================================================================
   SCROLL REVEAL
   ============================================================================ */

function setupScrollReveal() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll(
    '.hero__content, .stats__header, .stats__column, .competencies__header, .competencies__card, .timeline__header, .timeline__step, .cta-band__content, .faq__title, .faq__item, .partners__title, .partners__group, .footer__brand, .footer__column'
  );

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  targets.forEach((el) => el.classList.add('reveal'));

  const stagger = (nodeList) => {
    nodeList.forEach((el, i) => {
      el.style.setProperty('--d', Math.min(i * 55, 330) + 'ms');
    });
  };
  stagger(document.querySelectorAll('.competencies__card'));
  stagger(document.querySelectorAll('.stats__column'));
  stagger(document.querySelectorAll('.timeline__step'));
  stagger(document.querySelectorAll('.faq__item'));
  stagger(document.querySelectorAll('.partners__card'));

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  targets.forEach((el) => io.observe(el));
}

/* ============================================================================
   ACCESSIBILITY & KEYBOARD NAVIGATION
   ============================================================================ */

document.addEventListener('keydown', (e) => {
  // Escape key to close modals (if any)
  if (e.key === 'Escape') {
    const expandedToggles = document.querySelectorAll('[aria-expanded="false"]');
    expandedToggles.forEach(toggle => {
      if (toggle.classList.contains('faq__toggle')) {
        // Could implement collapse-all behavior here
      }
    });
  }
});
