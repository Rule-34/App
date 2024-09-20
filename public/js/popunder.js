;(function () {
  //version 1.0.0

  var adConfig = {
    ads_host: 'adsession.exacdn.com',
    syndication_host: 's.eunow4u.com',
    idzone: 1286,
    popup_fallback: false,
    popup_force: true,
    chrome_enabled: true,
    new_tab: true,
    frequency_period: 20,
    frequency_count: 1,
    trigger_method: 1,
    trigger_class: '',
    trigger_delay: 0,
    capping_enabled: true,
    only_inline: false
  }

  window.document.querySelectorAll ||
    (document.querySelectorAll =
      document.body.querySelectorAll =
      Object.querySelectorAll =
        function e(o, i, t, n, r) {
          var a = document,
            c = a.createStyleSheet()
          for (r = a.all, i = [], t = (o = o.replace(/\[for\b/gi, '[htmlFor').split(',')).length; t--; ) {
            for (c.addRule(o[t], 'k:v'), n = r.length; n--; ) r[n].currentStyle.k && i.push(r[n])
            c.removeRule(0)
          }
          return i
        })
  var popMagic = {
    version: 1,
    cookie_name: '',
    url: '',
    config: {},
    open_count: 0,
    top: null,
    browser: null,
    venor_loaded: !1,
    venor: !1,
    configTpl: {
      ads_host: '',
      syndication_host: '',
      idzone: '',
      frequency_period: 720,
      frequency_count: 1,
      trigger_method: 1,
      trigger_class: '',
      popup_force: !1,
      popup_fallback: !1,
      chrome_enabled: !0,
      new_tab: !1,
      cat: '',
      tags: '',
      el: '',
      sub: '',
      sub2: '',
      sub3: '',
      only_inline: !1,
      trigger_delay: 0,
      capping_enabled: !1,
      cookieconsent: !0
    },
    init: function (e) {
      if (void 0 !== e.idzone && e.idzone) {
        void 0 === e.customTargeting && (e.customTargeting = []), (window.customTargeting = e.customTargeting || null)
        var o = Object.keys(e.customTargeting).filter(function (e) {
          return e.search('ex_') >= 0
        })
        for (var i in (o.length &&
          o.forEach(
            function (e) {
              return (this.configTpl[e] = null)
            }.bind(this)
          ),
        this.configTpl))
          Object.prototype.hasOwnProperty.call(this.configTpl, i) &&
            (void 0 !== e[i] ? (this.config[i] = e[i]) : (this.config[i] = this.configTpl[i]))
        void 0 !== this.config.idzone &&
          '' !== this.config.idzone &&
          (!0 !== this.config.only_inline && this.loadHosted(), this.addEventToElement(window, 'load', this.preparePop))
      }
    },
    getCountFromCookie: function () {
      if (!this.config.cookieconsent) return 0
      var e = popMagic.getCookie(popMagic.cookie_name),
        o = void 0 === e ? 0 : parseInt(e)
      return isNaN(o) && (o = 0), o
    },
    getLastOpenedTimeFromCookie: function () {
      var e = popMagic.getCookie(popMagic.cookie_name),
        o = null
      if (void 0 !== e) {
        var i = e.split(';')[1]
        o = i > 0 ? parseInt(i) : 0
      }
      return isNaN(o) && (o = null), o
    },
    shouldShow: function () {
      if (!popMagic.config.capping_enabled) return 0 === popMagic.open_count
      if (popMagic.open_count >= popMagic.config.frequency_count) return !1
      var e = popMagic.getCountFromCookie()
      let o = popMagic.getLastOpenedTimeFromCookie(),
        i = Math.floor(Date.now() / 1e3),
        t = o + popMagic.config.trigger_delay
      return (!o || !(t > i)) && ((popMagic.open_count = e), !(e >= popMagic.config.frequency_count))
    },
    venorShouldShow: function () {
      return popMagic.venor_loaded && '0' === popMagic.venor
    },
    setAsOpened: function (e) {
      var o = e ? e.target || e.srcElement : null,
        i = { id: '', tagName: '', classes: '', text: '', href: '', elm: '' }
      void 0 !== o &&
        null != o &&
        (i = {
          id: void 0 !== o.id && null != o.id ? o.id : '',
          tagName: void 0 !== o.tagName && null != o.tagName ? o.tagName : '',
          classes: void 0 !== o.classList && null != o.classList ? o.classList : '',
          text: void 0 !== o.outerText && null != o.outerText ? o.outerText : '',
          href: void 0 !== o.href && null != o.href ? o.href : '',
          elm: o
        })
      var t = new CustomEvent('creativeDisplayed-' + popMagic.config.idzone, { detail: i })
      if ((document.dispatchEvent(t), !popMagic.config.capping_enabled)) {
        ++popMagic.open_count
        return
      }
      var n = 1
      n = 0 !== popMagic.open_count ? popMagic.open_count + 1 : popMagic.getCountFromCookie() + 1
      let r = Math.floor(Date.now() / 1e3)
      popMagic.config.cookieconsent &&
        popMagic.setCookie(popMagic.cookie_name, `${n};${r}`, popMagic.config.frequency_period)
    },
    loadHosted: function () {
      var e = document.createElement('script')
      for (var o in ((e.type = 'application/javascript'),
      (e.async = !0),
      (e.src = '//' + this.config.ads_host + '/popunder1000.js'),
      (e.id = 'popmagicldr'),
      this.config))
        Object.prototype.hasOwnProperty.call(this.config, o) &&
          'ads_host' !== o &&
          'syndication_host' !== o &&
          e.setAttribute('data-exo-' + o, this.config[o])
      var i = document.getElementsByTagName('body').item(0)
      i.firstChild ? i.insertBefore(e, i.firstChild) : i.appendChild(e)
    },
    preparePop: function () {
      if (!('object' == typeof exoJsPop101 && Object.prototype.hasOwnProperty.call(exoJsPop101, 'add'))) {
        if (((popMagic.top = self), popMagic.top !== self))
          try {
            top.document.location.toString() && (popMagic.top = top)
          } catch (e) {}
        if (((popMagic.cookie_name = 'zone-cap-' + popMagic.config.idzone), popMagic.shouldShow())) {
          var o = new XMLHttpRequest()
          o.onreadystatechange = function () {
            o.readyState == XMLHttpRequest.DONE &&
              ((popMagic.venor_loaded = !0),
              200 == o.status ? (popMagic.venor = o.responseText) : (popMagic.venor = '0'))
          }
          var i =
            'https:' !== document.location.protocol && 'http:' !== document.location.protocol
              ? 'https:'
              : document.location.protocol
          o.open('GET', i + '//' + popMagic.config.syndication_host + '/venor.php', !0)
          try {
            o.send()
          } catch (t) {
            popMagic.venor_loaded = !0
          }
        }
        if (
          (popMagic.buildUrl(),
          (popMagic.browser = popMagic.browserDetector.detectBrowser(navigator.userAgent)),
          popMagic.config.chrome_enabled || ('chrome' !== popMagic.browser.name && 'crios' !== popMagic.browser.name))
        ) {
          var n = popMagic.getPopMethod(popMagic.browser)
          popMagic.addEvent('click', n)
        }
      }
    },
    getPopMethod: function (e) {
      return popMagic.config.popup_force ||
        (popMagic.config.popup_fallback && 'chrome' === e.name && e.version >= 68 && !e.isMobile)
        ? popMagic.methods.popup
        : e.isMobile
          ? popMagic.methods.default
          : 'chrome' === e.name
            ? popMagic.methods.chromeTab
            : popMagic.methods.default
    },
    buildUrl: function () {
      var e,
        o,
        i =
          'https:' !== document.location.protocol && 'http:' !== document.location.protocol
            ? 'https:'
            : document.location.protocol,
        t = top === self ? document.URL : document.referrer,
        n = { type: 'inline', name: 'popMagic', ver: this.version },
        r = ''
      customTargeting &&
        Object.keys(customTargeting).length &&
        ('object' == typeof customTargeting ? Object.keys(customTargeting) : customTargeting).forEach(function (o) {
          'object' == typeof customTargeting
            ? (e = customTargeting[o])
            : Array.isArray(customTargeting) && (e = scriptEl.getAttribute(o)),
            (r += `&${o.replace('data-exo-', '')}=${e}`)
        }),
        (this.url =
          i +
          '//' +
          this.config.syndication_host +
          '/splash.php?cat=' +
          this.config.cat +
          '&idzone=' +
          this.config.idzone +
          '&type=8&p=' +
          encodeURIComponent(t) +
          '&sub=' +
          this.config.sub +
          ('' !== this.config.sub2 ? '&sub2=' + this.config.sub2 : '') +
          ('' !== this.config.sub3 ? '&sub3=' + this.config.sub3 : '') +
          '&block=1&el=' +
          this.config.el +
          '&tags=' +
          this.config.tags +
          '&cookieconsent=' +
          this.config.cookieconsent +
          '&scr_info=' +
          encodeURIComponent(btoa((o = n).type + '|' + o.name + '|' + o.ver)) +
          r)
    },
    addEventToElement: function (e, o, i) {
      e.addEventListener
        ? e.addEventListener(o, i, !1)
        : e.attachEvent
          ? ((e['e' + o + i] = i),
            (e[o + i] = function () {
              e['e' + o + i](window.event)
            }),
            e.attachEvent('on' + o, e[o + i]))
          : (e['on' + o] = e['e' + o + i])
    },
    addEvent: function (e, o) {
      var i
      if ('3' == popMagic.config.trigger_method) {
        for (r = 0, i = document.querySelectorAll('a'); r < i.length; r++) popMagic.addEventToElement(i[r], e, o)
        return
      }
      if ('2' == popMagic.config.trigger_method && '' != popMagic.config.trigger_method) {
        var t,
          n = []
        t =
          -1 === popMagic.config.trigger_class.indexOf(',')
            ? popMagic.config.trigger_class.split(' ')
            : popMagic.config.trigger_class.replace(/\s/g, '').split(',')
        for (var r = 0; r < t.length; r++) '' !== t[r] && n.push('.' + t[r])
        for (r = 0, i = document.querySelectorAll(n.join(', ')); r < i.length; r++)
          popMagic.addEventToElement(i[r], e, o)
        return
      }
      popMagic.addEventToElement(document, e, o)
    },
    setCookie: function (e, o, i) {
      if (!this.config.cookieconsent) return !1
      i = parseInt(i, 10)
      var t = new Date()
      t.setMinutes(t.getMinutes() + parseInt(i))
      var n = encodeURIComponent(o) + '; expires=' + t.toUTCString() + '; path=/'
      document.cookie = e + '=' + n
    },
    getCookie: function (e) {
      if (!this.config.cookieconsent) return !1
      var o,
        i,
        t,
        n = document.cookie.split(';')
      for (o = 0; o < n.length; o++)
        if (
          ((i = n[o].substr(0, n[o].indexOf('='))),
          (t = n[o].substr(n[o].indexOf('=') + 1)),
          (i = i.replace(/^\s+|\s+$/g, '')) === e)
        )
          return decodeURIComponent(t)
    },
    randStr: function (e, o) {
      for (var i = '', t = o || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', n = 0; n < e; n++)
        i += t.charAt(Math.floor(Math.random() * t.length))
      return i
    },
    isValidUserEvent: function (e) {
      return (
        ('isTrusted' in e && !!e.isTrusted && 'ie' !== popMagic.browser.name && 'safari' !== popMagic.browser.name) ||
        (0 != e.screenX && 0 != e.screenY)
      )
    },
    isValidHref: function (e) {
      return void 0 !== e && '' != e && !/\s?javascript\s?:/i.test(e)
    },
    findLinkToOpen: function (e) {
      var o = e,
        i = !1
      try {
        for (var t = 0; t < 20 && !o.getAttribute('href') && o !== document && 'html' !== o.nodeName.toLowerCase(); )
          (o = o.parentNode), t++
        var n = o.getAttribute('target')
        ;(n && -1 !== n.indexOf('_blank')) || (i = o.getAttribute('href'))
      } catch (r) {}
      return popMagic.isValidHref(i) || (i = !1), i || window.location.href
    },
    getPuId: function () {
      return 'ok_' + Math.floor(89999999 * Math.random() + 1e7)
    },
    browserDetector: {
      browserDefinitions: [
        ['firefox', /Firefox\/([0-9.]+)(?:\s|$)/],
        ['opera', /Opera\/([0-9.]+)(?:\s|$)/],
        ['opera', /OPR\/([0-9.]+)(:?\s|$)$/],
        ['edge', /Edg(?:e|)\/([0-9._]+)/],
        ['ie', /Trident\/7\.0.*rv:([0-9.]+)\).*Gecko$/],
        ['ie', /MSIE\s([0-9.]+);.*Trident\/[4-7].0/],
        ['ie', /MSIE\s(7\.0)/],
        ['safari', /Version\/([0-9._]+).*Safari/],
        ['chrome', /(?!Chrom.*Edg(?:e|))Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/],
        ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/],
        ['bb10', /BB10;\sTouch.*Version\/([0-9.]+)/],
        ['android', /Android\s([0-9.]+)/],
        ['ios', /Version\/([0-9._]+).*Mobile.*Safari.*/],
        ['yandexbrowser', /YaBrowser\/([0-9._]+)/],
        ['crios', /CriOS\/([0-9.]+)(:?\s|$)/]
      ],
      detectBrowser: function (e) {
        var o = e.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WebOS|Windows Phone/i)
        for (var i in this.browserDefinitions) {
          var t = this.browserDefinitions[i]
          if (t[1].test(e)) {
            var n = t[1].exec(e),
              r = n && n[1].split(/[._]/).slice(0, 3),
              a = Array.prototype.slice.call(r, 1).join('') || '0'
            return (
              r && r.length < 3 && Array.prototype.push.apply(r, 1 === r.length ? [0, 0] : [0]),
              {
                name: t[0],
                version: r.join('.'),
                versionNumber: parseFloat(r[0] + '.' + a),
                isMobile: o
              }
            )
          }
        }
        return { name: 'other', version: '1.0', versionNumber: 1, isMobile: o }
      }
    },
    methods: {
      default: function (e) {
        if (!popMagic.shouldShow() || !popMagic.venorShouldShow() || !popMagic.isValidUserEvent(e)) return !0
        var o = e.target || e.srcElement,
          i = popMagic.findLinkToOpen(o)
        return (
          window.open(i, '_blank'),
          popMagic.setAsOpened(e),
          (popMagic.top.document.location = popMagic.url),
          void 0 !== e.preventDefault && (e.preventDefault(), e.stopPropagation()),
          !0
        )
      },
      chromeTab: function (e) {
        if (
          !popMagic.shouldShow() ||
          !popMagic.venorShouldShow() ||
          !popMagic.isValidUserEvent(e) ||
          void 0 === e.preventDefault
        )
          return !0
        e.preventDefault(), e.stopPropagation()
        var o = top.window.document.createElement('a'),
          i = e.target || e.srcElement
        ;(o.href = popMagic.findLinkToOpen(i)), document.getElementsByTagName('body')[0].appendChild(o)
        var t = new MouseEvent('click', {
          bubbles: !0,
          cancelable: !0,
          view: window,
          screenX: 0,
          screenY: 0,
          clientX: 0,
          clientY: 0,
          ctrlKey: !0,
          altKey: !1,
          shiftKey: !1,
          metaKey: !0,
          button: 0
        })
        ;(t.preventDefault = void 0),
          o.dispatchEvent(t),
          o.parentNode.removeChild(o),
          window.open(popMagic.url, '_self'),
          popMagic.setAsOpened(e)
      },
      popup: function (e) {
        if (!popMagic.shouldShow() || !popMagic.venorShouldShow() || !popMagic.isValidUserEvent(e)) return !0
        var o = ''
        if (popMagic.config.popup_fallback && !popMagic.config.popup_force) {
          var i,
            t = Math.max(Math.round(0.8 * window.innerHeight), 300),
            n = Math.max(Math.round(0.7 * window.innerWidth), 300)
          o =
            'menubar=1,resizable=1,width=' +
            n +
            ',height=' +
            t +
            ',top=' +
            (window.screenY + 100) +
            ',left=' +
            (window.screenX + 100)
        }
        var r = document.location.href,
          a = window.open(r, popMagic.getPuId(), o)
        setTimeout(function () {
          a.location.href = popMagic.url
        }, 200),
          popMagic.setAsOpened(e),
          void 0 !== e.preventDefault && (e.preventDefault(), e.stopPropagation())
      }
    }
  }
  popMagic.init(adConfig)
})()
