/* ТехноЛогично — версия Руслана. Прогрессивное улучшение: без JS страница
   полностью читаема и работоспособна. JS добавляет мобильное меню и мягкие
   появления секций (с уважением к prefers-reduced-motion). */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Мобильное меню ---- */
  var header = document.querySelector('.site-header');
  var toggle = document.getElementById('nav-toggle');
  if (header && toggle) {
    var closeMenu = function () {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Клик по пункту меню и клавиша Esc — закрыть
    header.querySelectorAll('.nav__link, .header__cta').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---- Появление секций при скролле ---- */
  var targets = document.querySelectorAll(
    '.section__head, .comp-card, .fact, .faq-card, .logo-tile, .hero__content, .hero__visual, .about__head, .cta-band__inner, .apply__cta, .apply__info'
  );

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  targets.forEach(function (el) { el.classList.add('reveal'); });

  // Лёгкий стаггер внутри групп карточек
  var stagger = function (nodeList) {
    nodeList.forEach(function (el, i) {
      el.style.setProperty('--d', Math.min(i * 55, 330) + 'ms');
    });
  };
  stagger(document.querySelectorAll('.comp-card'));
  stagger(document.querySelectorAll('.fact'));
  stagger(document.querySelectorAll('.faq-card'));
  stagger(document.querySelectorAll('.logo-tile'));

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
