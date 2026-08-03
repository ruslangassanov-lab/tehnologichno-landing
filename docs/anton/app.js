/* ТехноЛогично — Антон. Прогрессивное улучшение: без JS страница
   читаема. JS добавляет мягкие появления секций (как src/ruslan)
   и подчёркивание навигации слева→направо. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav underline: fills left → right on hover */
  (function setupNavUnderline() {
    var links = document.querySelectorAll('.site-header__nav a');
    if (!links.length) return;

    links.forEach(function (link) {
      var line = document.createElement('span');
      line.className = 'site-header__nav-line';
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

  var targets = document.querySelectorAll(
    '.card--hero, .competencies__title, .competencies__list li, .cta-band, .faq__title, .faq__card, .logos__title, .logo, .site-footer__block, .footer-legal'
  );

  if (!targets.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  targets.forEach(function (el) { el.classList.add('reveal'); });

  var stagger = function (nodeList) {
    nodeList.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i * 55, 330) + 'ms');
    });
  };
  stagger(document.querySelectorAll('.competencies__list li'));
  stagger(document.querySelectorAll('.faq__card'));
  stagger(document.querySelectorAll('.logo'));

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  targets.forEach(function (el) { io.observe(el); });
})();
