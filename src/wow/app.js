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
});

/* ============================================================================
   FAQ ACCORDION
   ============================================================================ */

function setupFaqAccordion() {
  const toggles = document.querySelectorAll('.faq__toggle');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const item = toggle.closest('.faq__item');
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

      // Toggle state
      toggle.setAttribute('aria-expanded', !isExpanded);

      // Rotate icon (or change + to -)
      if (isExpanded) {
        toggle.textContent = '+';  // Was expanded, now collapsed
      } else {
        toggle.textContent = '−';  // Was collapsed, now expanded
      }

      // Hide/show answer
      const answer = item.querySelector('.faq__answer');
      if (isExpanded) {
        answer.style.display = 'none';
      } else {
        answer.style.display = 'block';
      }
    });
  });

  // Also handle click on the question itself
  const questions = document.querySelectorAll('.faq__question');
  questions.forEach(question => {
    question.style.cursor = 'pointer';
    question.addEventListener('click', () => {
      const toggle = question.closest('.faq__item').querySelector('.faq__toggle');
      toggle.click();
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
  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {
    // Add hover ripple effect (optional)
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.02)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
    });

    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      button.style.transition = 'none';
    }
  });
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
