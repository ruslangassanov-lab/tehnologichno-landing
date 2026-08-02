(function(){
  var here = location.pathname.indexOf("/ruslan") > -1 ? "ruslan" : "anton";
  try{ localStorage.setItem("tehno_version", here); }catch(e){}
  var bar = document.createElement("nav");
  bar.id = "vswitch"; bar.setAttribute("aria-label","Переключатель версий");
  bar.innerHTML = \x27<span>Версия:</span>\x27 +
    \x27<a href="../anton/" \x27+(here==="anton"?\x27aria-current="page"\x27:"")+\x27>Макет Антона</a>\x27 +
    \x27<a href="../ruslan/" \x27+(here==="ruslan"?\x27aria-current="page"\x27:"")+\x27>Руслан ВАУ</a>\x27;
  document.body.insertBefore(bar, document.body.firstChild);
})();
