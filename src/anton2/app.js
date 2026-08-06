/* ТехноЛогично — Антон. Прогрессивное улучшение: без JS страница
   читаема. JS добавляет появления при скролле, подчёркивание навигации
   и hover по группам компетенций (классы ah-* / ac-*). */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Desktop first screen: measure real viewport (zoom, DPI, cookie bar)
     and size the banner in px so Safari never collapses cqw×var height.
     ≤1024 untouched. */
  (function fitFirstScreen() {
    var mq = window.matchMedia('(min-width: 1025px)');
    var fs = document.querySelector('.ah-first-screen');
    var canvas = document.querySelector('.ah-canvas');
    var hero = document.querySelector('.ah-hero');
    if (!fs || !canvas || !hero) return;

    var BASE_W = 0.9095912;
    var BASE_H = 0.3305818;
    var MAX_SCALE = 1.05;
    var MIN_SCALE = 0.62;
    var AIR = 20;
    var PAD_TOP = 20;
    var SWITCHER = 52;
    var timer = 0;

    function consentH() {
      var el = document.getElementById('pd-consent');
      if (!el || !el.classList.contains('is-visible')) return 0;
      var h = el.getBoundingClientRect().height;
      return h > 0 ? h : 0;
    }

    function apply() {
      if (!mq.matches) {
        fs.style.removeProperty('--ah-fs-hero-scale');
        fs.style.removeProperty('--ah-fs-banner-inset');
        hero.style.removeProperty('--ah-hero-scale');
        hero.style.removeProperty('width');
        hero.style.removeProperty('height');
        return;
      }

      var cw = canvas.getBoundingClientRect().width;
      if (!(cw > 1)) return;

      var header = fs.querySelector('.ah-header');
      var headerH = header ? header.getBoundingClientRect().height : 48;
      if (!(headerH > 0)) headerH = 48;

      var avail =
        window.innerHeight -
        SWITCHER -
        PAD_TOP -
        headerH -
        AIR * 2 -
        consentH();
      if (!(avail > 120)) avail = 120;

      var baseW = cw * BASE_W;
      var baseH = cw * BASE_H;
      if (!(baseW > 0) || !(baseH > 0)) return;

      var scale = Math.min(MAX_SCALE, (cw * 0.98) / baseW, avail / baseH);
      if (!(scale > 0) || !isFinite(scale)) scale = 1;
      if (scale < MIN_SCALE) scale = MIN_SCALE;
      if (scale > MAX_SCALE) scale = MAX_SCALE;

      var w = baseW * scale;
      var h = baseH * scale;
      var inset = Math.max(0, (cw - w) / 2);
      var scaleStr = scale.toFixed(4);

      fs.style.setProperty('--ah-fs-hero-scale', scaleStr);
      fs.style.setProperty('--ah-fs-banner-inset', inset.toFixed(2) + 'px');
      hero.style.setProperty('--ah-hero-scale', scaleStr);
      hero.style.width = w.toFixed(2) + 'px';
      hero.style.height = h.toFixed(2) + 'px';

      /* First screen must paint immediately (no scroll-reveal race in Safari) */
      hero.classList.add('is-visible');
      if (header) header.classList.add('is-visible');
    }

    function schedule() {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(apply, 50);
    }

    apply();
    window.addEventListener('resize', schedule, { passive: true });
    if (mq.addEventListener) mq.addEventListener('change', schedule);
    else if (mq.addListener) mq.addListener(schedule);

    var consent = document.getElementById('pd-consent');
    if (consent) {
      var mo = new MutationObserver(schedule);
      mo.observe(consent, { attributes: true, attributeFilter: ['class'] });
    } else {
      var boot = new MutationObserver(function () {
        var el = document.getElementById('pd-consent');
        if (!el) return;
        boot.disconnect();
        var mo = new MutationObserver(schedule);
        mo.observe(el, { attributes: true, attributeFilter: ['class'] });
        schedule();
      });
      boot.observe(document.body, { childList: true, subtree: true });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
  })();

  /* Nav underline: fills left → right on hover */
  (function setupNavUnderline() {
    var links = document.querySelectorAll('.ah-nav a');
    if (!links.length) return;

    links.forEach(function (link) {
      /* Underline is position:absolute — needs a positioned anchor (flex
         layouts often set static, which breaks hover line placement). */
      if (getComputedStyle(link).position === 'static') {
        link.style.position = 'relative';
      }

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

  /* Hash nav: #about / #competencies (and #top) land with H2 fully below chrome.
     Native hash + scroll-margin fail here — html/body overflow-x:hidden clips
     scroll-margin, so titles sit under fixed #vswitch and look “mid-section”.
     Offset mirrors --ah-hash-scroll-mt: max(5rem, switcher + 4rem). */
  (function setupHashNav() {
    var SKIP = { docs: true };

    var remPx = function () {
      return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    };

    var hashOffset = function () {
      var switcher = document.getElementById('vswitch');
      var sh = switcher ? switcher.getBoundingClientRect().height : 52;
      if (!sh || sh < 40) sh = 52;
      var rem = remPx();
      return Math.max(5 * rem, sh + 4 * rem);
    };

    var revealTarget = function (el) {
      var block = el.closest('.about-block, .ac-sec');
      if (block) block.classList.add('is-visible');
      el.classList.add('is-visible');
    };

    var scrollToEl = function (el, smooth) {
      if (!el) return;
      revealTarget(el);
      var top = el.getBoundingClientRect().top + window.pageYOffset - hashOffset();
      if (top < 0) top = 0;
      window.scrollTo({
        top: top,
        behavior: smooth && !reduce ? 'smooth' : 'auto'
      });
    };

    var scrollToHash = function (hash, smooth) {
      if (!hash || hash === '#') return false;
      var id = hash.charAt(0) === '#' ? hash.slice(1) : hash;
      if (!id || SKIP[id]) return false;
      var el = document.getElementById(id);
      if (!el) return false;
      scrollToEl(el, smooth);
      return true;
    };

    var onAnchorClick = function (e) {
      var link = e.currentTarget;
      var href = link.getAttribute('href');
      if (!href || href.charAt(0) !== '#') return;
      var id = href.slice(1);
      if (!id || SKIP[id]) return;
      if (!document.getElementById(id)) return;
      e.preventDefault();
      if (history.pushState) {
        history.pushState(null, '', href);
      } else {
        location.hash = href;
      }
      scrollToHash(href, true);
    };

    document.querySelectorAll(
      '.ah-nav a[href^="#"]:not(.n3), .ah-header__brand[href^="#"]'
    ).forEach(function (link) {
      link.addEventListener('click', onAnchorClick);
    });

    var applyLocationHash = function (smooth) {
      if (!location.hash || location.hash === '#') return;
      scrollToHash(location.hash, smooth);
    };

    window.addEventListener('hashchange', function () {
      applyLocationHash(true);
    });

    /* After layout + switcher mount (switcher.js is sync after this defer file
       on first paint order — re-run on load for cold #hash URLs). */
    if (location.hash && location.hash !== '#' && !SKIP[location.hash.slice(1)]) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          applyLocationHash(false);
        });
      });
      window.addEventListener('load', function () {
        applyLocationHash(false);
      });
    }
  })();

  /* Competencies carousel (ac-carousel): slide track + highlight visible cards.
     Runs before the reveal early-return so arrows work with reduced motion.
     visibleCount: 3 desktop / 2 tablet / 1 phone; touch swipe supported.
     #competencies lives on the H2 — resolve .ac-sec for queries. */
  (function setupCompetencyCarousel() {
    var heading = document.getElementById('competencies');
    if (!heading) return;

    var section = heading.closest('.ac-sec') || heading.parentElement;
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
    var lastLayoutWidth = window.innerWidth;

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

    var syncChrome = function () {
      updateActive();
      leftBtn.disabled = index <= 0;
      rightBtn.disabled = index >= maxIndex;
    };

    /* Measure card step at translateX(0). Must restore the current page
       offset while transition is still none — otherwise the next apply()
       animates 0 → index and looks like spontaneous sliding (common on
       mobile when URL-bar show/hide fires resize). */
    var measure = function () {
      visibleCount = getVisibleCount();
      section.setAttribute('data-ac-visible', String(visibleCount));

      track.style.transition = 'none';
      track.style.transform = 'translateX(0px)';
      void track.offsetWidth;

      var card1Offset = cards.length > 1 ? cards[1].offsetLeft : 0;
      var card0Offset = cards[0].offsetLeft;

      step = card1Offset - card0Offset;
      baseOffset = 0;

      maxIndex = Math.max(0, cards.length - visibleCount);
      index = Math.min(index, maxIndex);

      var x = baseOffset - index * step;
      track.style.transform = 'translateX(' + x + 'px)';
      void track.offsetWidth;
    };

    var apply = function (animated) {
      var x = baseOffset - index * step;
      var useMotion = animated !== false && !reduce;
      var transition = useMotion
        ? 'transform 420ms cubic-bezier(.22,.61,.36,1)'
        : 'none';
      track.style.transition = transition;
      track.style.transform = 'translateX(' + x + 'px)';
      if (!useMotion) void track.offsetWidth;
      syncChrome();
    };

    var go = function (delta) {
      index = Math.max(0, Math.min(maxIndex, index + delta));
      apply(true);
    };

    carousel.classList.add('is-active');
    measure();
    apply(false);

    leftBtn.addEventListener('click', function () { go(-1); });
    rightBtn.addEventListener('click', function () { go(1); });

    /* Touch / pointer swipe — discrete page steps only, no momentum.
       Capture only after horizontal lock so vertical page scroll stays free. */
    (function setupSwipe() {
      var target = viewport || track;
      var startX = 0;
      var startY = 0;
      var tracking = false;
      var axis = null;
      var activePointerId = null;

      var endGesture = function () {
        tracking = false;
        axis = null;
        activePointerId = null;
      };

      target.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        tracking = true;
        axis = null;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
      });

      target.addEventListener('pointermove', function (e) {
        if (!tracking || e.pointerId !== activePointerId) return;
        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        if (!axis) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
          if (axis === 'x') {
            try { target.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
          } else {
            endGesture();
            return;
          }
        }
        if (axis === 'x') e.preventDefault();
      }, { passive: false });

      target.addEventListener('pointerup', function (e) {
        if (!tracking || e.pointerId !== activePointerId) return;
        var dx = e.clientX - startX;
        var didSwipe = axis === 'x' && Math.abs(dx) > 40;
        endGesture();
        if (didSwipe) go(dx < 0 ? 1 : -1);
      });

      target.addEventListener('pointercancel', function (e) {
        if (activePointerId != null && e.pointerId !== activePointerId) return;
        endGesture();
      });
    })();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var w = window.innerWidth;
        /* Height-only resize (mobile chrome) must not remasure/animate. */
        if (w === lastLayoutWidth) return;
        lastLayoutWidth = w;
        measure();
        apply(false);
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
