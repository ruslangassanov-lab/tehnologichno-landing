(function(){
  var here = location.pathname.indexOf("/hero") > -1 ? "hero" : "anton";
  try{ localStorage.setItem("tehno_version", here); }catch(e){}
  var bar = document.createElement("nav");
  bar.id = "vswitch"; bar.setAttribute("aria-label","Переключатель версий");
  bar.innerHTML = '<span>Версия:</span>' +
    '<a href="../anton/" '+(here==="anton"?'aria-current="page"':"")+'>Стандартная</a>' +
    '<a href="../hero/" '+(here==="hero"?'aria-current="page"':"")+'>Новая</a>';
  document.body.insertBefore(bar, document.body.firstChild);
})();
