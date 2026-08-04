(function(){
  var path = location.pathname;
  var here = path.indexOf("/wow") > -1 ? "wow" : path.indexOf("/anton") > -1 ? "anton" : "ruslan";
  try{ localStorage.setItem("tehno_version", here); }catch(e){}
  var bar = document.createElement("nav");
  bar.id = "vswitch"; bar.setAttribute("aria-label","Переключатель версий");
  bar.innerHTML = '<span>Версия:</span>' +
    '<a href="../anton/" '+(here==="anton"?'aria-current="page"':"")+'>Стандартная</a>' +
    '<a href="../wow/" '+(here==="wow"?'aria-current="page"':"")+'>Новая</a>';
  document.body.insertBefore(bar, document.body.firstChild);
})();
