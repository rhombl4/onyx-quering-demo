'use strict';

(function () {
  const xhr = new XMLHttpRequest();

  const path = [
    '/',
    Date.now(),
    '/css/academy/v2/06cb83/',
    window.location.hostname,
    '.css',
  ].join('');

  xhr.open('GET', path, false);

  xhr.send();

  if (xhr.status === 200) {
    const style = document.createElement('style');
    style.appendChild(document.createTextNode(xhr.responseText));
    document.body.appendChild(style);
  }
})();
