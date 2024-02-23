var _paq = window._paq = window._paq || []

/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(["setDomains", ["*.r34.app","*.alt.r34.app","*.dev.r34.app"]]);
_paq.push(["enableCrossDomainLinking"]);

_paq.push(['setExcludedQueryParams', ['page', 'cursor']]);

(function () {
  var u = 'https://matomo.akbal.dev/'

  _paq.push(['setTrackerUrl', u + 'matomo.php'])
  _paq.push(['setSiteId', '1'])
})()
