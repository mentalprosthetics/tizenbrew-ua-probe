/* TizenBrew mods inject — websiteURL already hits webhook with the real UA.
   Keep this tiny; do not navigate away. */
(function () {
  try {
    var ua = navigator.userAgent || '';
    if (typeof console !== 'undefined' && console.log) console.log('[ua-probe]', ua);
  } catch (e) {}
})();
