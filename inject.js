/* Optional mods inject — primary evidence is ua-lab.html (on-screen + multi-beacon). */
(function () {
  try {
    if (typeof console !== 'undefined' && console.log) {
      console.log('[ua-probe inject]', navigator.userAgent);
    }
  } catch (e) {}
})();
