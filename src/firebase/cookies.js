
// COOKIES
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; path=/; SameSite=None; Secure`;
}

function getCookie(name) {
  var nameEQ = name + "=";
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  return null;
}

function deleteCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

function clearCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      var igualPos = cookie.indexOf("=");
      var nome = igualPos > -1 ? cookie.substr(0, igualPos) : cookie;

      // Apaga o cookie para o path atual
      document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

      // Opcionalmente, apaga o cookie para todos os subdomínios
      document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + window.location.hostname;

      // Apaga o cookie para o domínio principal, removendo subdomínios
      var domainParts = window.location.hostname.split(".");
      if (domainParts.length > 2) {
          domainParts.shift(); // Remove o subdomínio
          var domain = domainParts.join(".");
          document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + domain;
      }
  }
}

export { setCookie, deleteCookie, getCookie, clearCookies };