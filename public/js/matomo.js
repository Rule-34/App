var _paq = window._paq = window._paq || []

/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
_paq.push(['setCookieDomain', '*.r34.app'])
_paq.push(['setDomains', ['*.r34.app']])

_paq.push(['setExcludedQueryParams', ['page', 'cursor']])

_paq.push(['trackPageView'])
_paq.push(['enableLinkTracking']);

(function () {
  var u = 'https://matomo.akbal.dev/'

  _paq.push(['setTrackerUrl', u + 'matomo.php'])
  _paq.push(['setSiteId', '1'])

  var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0]
  g.async = true
  g.src = u + 'matomo.js'
  s.parentNode.insertBefore(g, s)
})()
