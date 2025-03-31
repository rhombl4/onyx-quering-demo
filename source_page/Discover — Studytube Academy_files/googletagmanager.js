(function () {
  var domain = window.location.hostname;
  var STUDYTUBE_LXP_GTM_ID = 'GTM-58KBFKW';
  var CUSTOM_GTM_IDS = {};
  CUSTOM_GTM_IDS['samenmetco.studytube.nl'] = 'GTM-PKZ64TX';
  CUSTOM_GTM_IDS['bol.studytube.nl'] = 'GTM-MZ6FXPT';
  CUSTOM_GTM_IDS['olympia.studytube.nl'] = 'GTM-PKZ64TX';
  window.GTM_ID = CUSTOM_GTM_IDS[domain] || STUDYTUBE_LXP_GTM_ID;
})();

(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js',
  });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', window.GTM_ID);
