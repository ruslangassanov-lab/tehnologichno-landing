(function () {
  var path = location.pathname;
  var here =
    path.indexOf("/hero") > -1 || path.indexOf("/wow") > -1
      ? "hero"
      : path.indexOf("/anton2") > -1
        ? "anton2"
        : path.indexOf("/anton") > -1
          ? "anton"
          : "";
  try {
    localStorage.setItem("tehno_version", here || "anton");
  } catch (e) {}
  var bar = document.createElement("nav");
  bar.id = "vswitch";
  bar.setAttribute("aria-label", "Переключатель версий");
  bar.innerHTML =
    "<span>Версия:</span>" +
    '<a href="../anton/" ' +
    (here === "anton" ? 'aria-current="page"' : "") +
    ">Стандартная</a>" +
    '<a href="../anton2/" ' +
    (here === "anton2" ? 'aria-current="page"' : "") +
    ">Вторая версия</a>" +
    '<a href="../hero/" ' +
    (here === "hero" ? 'aria-current="page"' : "") +
    ">Новая</a>";
  document.body.insertBefore(bar, document.body.firstChild);
})();
