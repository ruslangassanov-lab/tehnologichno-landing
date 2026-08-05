(function () {
  var STORAGE_KEY = "pd_consent";

  function hasConsent() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function saveConsent() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {}
  }

  function privacyHref() {
    var path = location.pathname || "";
    if (/\/(anton2?|hero|wow)\/?$/.test(path) || /\/(anton2?|hero|wow)\//.test(path)) {
      return "../privacy.html";
    }
    return "privacy.html";
  }

  function hideBanner(el) {
    el.classList.remove("is-visible");
    el.classList.add("is-hiding");
    var done = function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
    el.addEventListener("transitionend", done, { once: true });
    setTimeout(done, 500);
  }

  function showBanner() {
    var root = document.createElement("aside");
    root.id = "pd-consent";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "false");
    root.setAttribute("aria-labelledby", "pd-consent-title");
    root.setAttribute("aria-describedby", "pd-consent-desc");

    var policy = privacyHref();
    root.innerHTML =
      '<div class="pd-consent__inner">' +
      '<p class="pd-consent__text" id="pd-consent-desc">' +
      '<span id="pd-consent-title" class="visually-hidden">Согласие на обработку персональных данных</span>' +
      "Мы используем файлы cookie и обрабатываем персональные данные. Продолжая пользоваться сайтом, вы соглашаетесь с " +
      '<a class="pd-consent__link" href="' +
      policy +
      '">Политикой обработки персональных данных</a>.' +
      "</p>" +
      '<div class="pd-consent__actions">' +
      '<a class="pd-consent__btn pd-consent__btn--ghost" href="' +
      policy +
      '">Подробнее</a>' +
      '<button type="button" class="pd-consent__btn pd-consent__btn--primary" id="pd-consent-accept">' +
      "Согласен" +
      "</button>" +
      "</div>" +
      "</div>";

    /* sr-only without depending on site utilities */
    var style = document.createElement("style");
    style.textContent =
      "#pd-consent .visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}";
    document.head.appendChild(style);

    document.body.appendChild(root);

    var accept = root.querySelector("#pd-consent-accept");
    accept.addEventListener("click", function () {
      saveConsent();
      hideBanner(root);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.add("is-visible");
      });
    });
  }

  function init() {
    if (hasConsent()) return;
    showBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(init, 400);
    });
  } else {
    setTimeout(init, 400);
  }
})();
