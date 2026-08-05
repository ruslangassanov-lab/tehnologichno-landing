/* ТехноЛогично — Антон. Прогрессивное улучшение: без JS страница
   читаема. JS добавляет появления при скролле, подчёркивание навигации
   и hover по группам компетенций (классы ah-* / ac-*). */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav underline: fills left → right on hover */
  (function setupNavUnderline() {
    var links = document.querySelectorAll('.ah-nav a');
    if (!links.length) return;

    links.forEach(function (link) {
      var line = document.createElement('span');
      line.className = 'ah-nav-line';
      line.setAttribute('aria-hidden', 'true');
      link.appendChild(line);

      link.addEventListener('mouseenter', function () {
        line.classList.add('is-on');
      });
      link.addEventListener('mouseleave', function () {
        line.classList.remove('is-on');
      });
      link.addEventListener('focus', function () {
        line.classList.add('is-on');
      });
      link.addEventListener('blur', function () {
        line.classList.remove('is-on');
      });
    });
  })();

  /* Documents modal — nav «Документы» */
  (function setupDocsModal() {
    var trigger = document.querySelector('.ah-nav a.n3');
    var modal = document.getElementById('docs-modal');
    if (!trigger || !modal) return;

    var dialog = modal.querySelector('.about-modal__dialog');
    var closeBtn = modal.querySelector('.about-modal__close');
    var lastFocus = null;

    var focusableSelector =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

    var getFocusable = function () {
      return Array.prototype.slice.call(dialog.querySelectorAll(focusableSelector))
        .filter(function (el) {
          return el.offsetParent !== null || el === document.activeElement;
        });
    };

    var open = function () {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('docs-modal-open');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          modal.classList.add('is-open');
          if (closeBtn) closeBtn.focus();
          else if (dialog) dialog.focus();
        });
      });
    };

    var close = function () {
      modal.classList.remove('is-open');
      document.body.classList.remove('docs-modal-open');

      var finish = function () {
        modal.hidden = true;
        if (lastFocus && typeof lastFocus.focus === 'function') {
          lastFocus.focus();
        }
      };

      if (reduce) {
        finish();
        return;
      }

      var done = false;
      var onEnd = function (e) {
        if (e.target !== modal) return;
        done = true;
        modal.removeEventListener('transitionend', onEnd);
        finish();
      };
      modal.addEventListener('transitionend', onEnd);
      setTimeout(function () {
        if (done) return;
        modal.removeEventListener('transitionend', onEnd);
        finish();
      }, 350);
    };

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });

    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-docs-close]')) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      if (e.key !== 'Tab') return;

      var items = getFocusable();
      if (!items.length) {
        e.preventDefault();
        if (dialog) dialog.focus();
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !dialog.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  })();

  /* Competencies: hover/focus highlights a whole competence card */
  (function setupCompetenciesHover() {
    var cards = document.querySelectorAll('.ac-sec .ac-card');
    if (!cards.length) return;

    var setOn = function (card) {
      cards.forEach(function (c) { c.classList.remove('is-hot'); });
      card.classList.add('is-hot');
    };

    var setOff = function (card) {
      card.classList.remove('is-hot');
    };

    cards.forEach(function (card) {
      card.setAttribute('tabindex', '0');
      card.addEventListener('mouseenter', function () { setOn(card); });
      card.addEventListener('mouseleave', function () { setOff(card); });
      card.addEventListener('focus', function () { setOn(card); });
      card.addEventListener('blur', function () { setOff(card); });
    });
  })();

  /* Mobile / tablet header nav toggle */
  (function setupMobileNav() {
    var header = document.querySelector('.ah-header');
    var toggle = document.querySelector('.ah-nav-toggle');
    var nav = document.getElementById('ah-site-nav');
    if (!header || !toggle || !nav) return;

    var mq = window.matchMedia('(max-width: 768px)');

    var setOpen = function (open) {
      header.classList.toggle('is-nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    };

    var close = function () { setOpen(false); };

    toggle.addEventListener('click', function () {
      setOpen(!header.classList.contains('is-nav-open'));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    var onMq = function () {
      if (!mq.matches) close();
    };
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onMq);
    else if (typeof mq.addListener === 'function') mq.addListener(onMq);
  })();

  /* Competencies carousel (ac-carousel): slide track + highlight visible cards.
     Runs before the reveal early-return so arrows work with reduced motion.
     visibleCount: 3 desktop / 2 tablet / 1 phone; touch swipe supported. */
  (function setupCompetencyCarousel() {
    var section = document.getElementById('competencies');
    if (!section) return;

    var carousel = section.querySelector('.ac-carousel');
    var track = section.querySelector('.ac-cards');
    var viewport = section.querySelector('.ac-viewport');
    if (!carousel || !track) return;

    var leftBtn = carousel.querySelector('.ac-carousel__arrow--left');
    var rightBtn = carousel.querySelector('.ac-carousel__arrow--right');
    if (!leftBtn || !rightBtn) return;

    var cards = Array.prototype.slice.call(track.querySelectorAll('.ac-card'));
    if (cards.length < 2) return;

    var visibleCount = 3;
    var maxIndex = Math.max(0, cards.length - visibleCount);
    var index = 0;

    var step = 0;
    var baseOffset = 0;

    var getVisibleCount = function () {
      var w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return 3;
    };

    var updateActive = function () {
      cards.forEach(function (c, i) {
        c.classList.toggle('is-active', i >= index && i < index + visibleCount);
      });
    };

    var measure = function () {
      visibleCount = getVisibleCount();
      section.setAttribute('data-ac-visible', String(visibleCount));

      // Reset so offsetLeft measurements are stable.
      track.style.transition = 'none';
      track.style.transform = 'translateX(0px)';

      var card1Offset = cards.length > 1 ? cards[1].offsetLeft : 0;
      var card0Offset = cards[0].offsetLeft;

      step = card1Offset - card0Offset;
      baseOffset = 0;

      maxIndex = Math.max(0, cards.length - visibleCount);
      index = Math.min(index, maxIndex);
    };

    var apply = function () {
      var x = baseOffset - index * step;
      var transition = reduce ? 'none' : 'transform 420ms cubic-bezier(.22,.61,.36,1)';
      track.style.transition = transition;
      track.style.transform = 'translateX(' + x + 'px)';
      updateActive();

      leftBtn.disabled = index <= 0;
      rightBtn.disabled = index >= maxIndex;
    };

    var go = function (delta) {
      index = Math.max(0, Math.min(maxIndex, index + delta));
      apply();
    };

    carousel.classList.add('is-active');
    measure();
    apply();

    leftBtn.addEventListener('click', function () { go(-1); });
    rightBtn.addEventListener('click', function () { go(1); });

    /* Touch / pointer swipe on the viewport */
    (function setupSwipe() {
      var target = viewport || track;
      var startX = 0;
      var startY = 0;
      var tracking = false;
      var axis = null;

      target.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        tracking = true;
        axis = null;
        startX = e.clientX;
        startY = e.clientY;
        try { target.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      });

      target.addEventListener('pointermove', function (e) {
        if (!tracking) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (!axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        if (axis === 'x') e.preventDefault();
      }, { passive: false });

      target.addEventListener('pointerup', function (e) {
        if (!tracking) return;
        tracking = false;
        var dx = e.clientX - startX;
        if (axis === 'x' && Math.abs(dx) > 40) {
          go(dx < 0 ? 1 : -1);
        }
        axis = null;
      });

      target.addEventListener('pointercancel', function () {
        tracking = false;
        axis = null;
      });
    })();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        measure();
        apply();
      }, 80);
    });
  })();

  /* Competencies: skip scroll reveal/fade-in — show immediately (carousel keeps sliding). */
  document.querySelectorAll('.ac-sec, .ac-title, .ac-card').forEach(function (el) {
    el.classList.add('is-visible');
  });

  /* Footer excluded: absolute % children + transform-as-containing-block
     collapses layout into a heap until is-visible. Paint footer final. */
  var targets = document.querySelectorAll(
    [
      '.ah-header',
      '.ah-hero',
      '.about-block',
      '.about-bullet',
      '.cta-block',
      '.ac-ctatitle',
      '.ac-pill',
      '.ac-pillarrow',
      '.faq__title',
      '.faq__card',
      '.logos__title',
      '.logo'
    ].join(', ')
  );

  if (!targets.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  targets.forEach(function (el) {
    el.classList.add('reveal');
    if (el.classList.contains('logo')) {
      el.classList.add('reveal--fade');
    }
  });

  var stagger = function (nodeList, step, cap) {
    step = step == null ? 55 : step;
    cap = cap == null ? 330 : cap;
    nodeList.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i * step, cap) + 'ms');
    });
  };

  stagger(document.querySelectorAll('.faq__card'));
  stagger(document.querySelectorAll('.logo'));
  stagger(document.querySelectorAll('.about-bullet'), 70, 320);

  /* Double rAF: ensure .reveal (opacity:0) is painted before is-visible,
     so titles actually transition instead of appearing already visible. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      io.unobserve(el);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.add('is-visible');
        });
      });
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.12 });

  targets.forEach(function (el) { io.observe(el); });
})();
