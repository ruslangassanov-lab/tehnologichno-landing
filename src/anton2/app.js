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

  /* Footer excluded: absolute % children + transform-as-containing-block
     collapses layout into a heap until is-visible. Paint footer final. */
  var targets = document.querySelectorAll(
    [
      '.ah-header',
      '.ah-hero',
      '.ac-sec',
      '.ac-title',
      '.ac-card',
      '.about-block',
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
  stagger(document.querySelectorAll('.ac-card'), 45, 400);

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
