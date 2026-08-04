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

  /* Competencies: hover/focus highlights a whole competence (1–2 lines) */
  (function setupCompetenciesHover() {
    var sec = document.querySelector('.ac-sec');
    if (!sec) return;

    var groups = [
      ['.ac-L1'],
      ['.ac-L2a', '.ac-L2b'],
      ['.ac-L3a', '.ac-L3b'],
      ['.ac-L4a', '.ac-L4b'],
      ['.ac-L5a', '.ac-L5b'],
      ['.ac-R1'],
      ['.ac-R2a', '.ac-R2b'],
      ['.ac-R3a', '.ac-R3b'],
      ['.ac-R4a', '.ac-R4b'],
      ['.ac-R5a', '.ac-R5b']
    ];

    groups.forEach(function (sels) {
      var nodes = sels.map(function (s) { return sec.querySelector(s); }).filter(Boolean);
      if (!nodes.length) return;

      nodes.forEach(function (el) {
        el.classList.add('ac-item');
        el.setAttribute('tabindex', '0');
      });

      var setOn = function () {
        nodes.forEach(function (el) { el.classList.add('is-hot'); });
      };
      var setOff = function () {
        nodes.forEach(function (el) { el.classList.remove('is-hot'); });
      };

      nodes.forEach(function (el) {
        el.addEventListener('mouseenter', setOn);
        el.addEventListener('mouseleave', setOff);
        el.addEventListener('focus', setOn);
        el.addEventListener('blur', setOff);
      });
    });
  })();

  /* Footer excluded: absolute % children + transform-as-containing-block
     collapses layout into a heap until is-visible. Paint footer final. */
  var targets = document.querySelectorAll(
    [
      '.ah-hero',
      '.ac-sec',
      '.ac-title',
      '.ac-item',
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
  stagger(document.querySelectorAll('.ac-item'), 45, 400);

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
