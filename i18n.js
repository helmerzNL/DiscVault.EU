/*
 * Lightweight i18n loader for DiscVault.EU.
 *
 * Translations live as one flat JSON file per language in i18n/<lang>.json
 * (a plain { "key": "value" } map). To translate the site you only edit those
 * files; any key missing from a language automatically falls back to English.
 *
 * Pages opt in by giving elements a data-i18n="key" attribute and including
 * this script. Set window.DV_SET_HTML_LANG = false before loading it to keep
 * the document's <html lang> attribute untouched (used by the fixed-language
 * legal pages).
 */
(function () {
  'use strict';

  var SUPPORTED = [
    'da', 'de', 'el', 'en', 'es', 'cs', 'fr', 'hu', 'it', 'ja',
    'ko', 'nl', 'no', 'pl', 'pt', 'fi', 'sv', 'tr', 'uk', 'zh'
  ];
  var FALLBACK = 'en';
  var VERSION = '1';

  // Resolve the i18n/ directory relative to this script so it works from any page.
  var base = './i18n/';
  try {
    var self = document.currentScript && document.currentScript.src;
    if (self) base = self.replace(/[^/]*(?:\?.*)?$/, '') + 'i18n/';
  } catch (e) {}

  var cache = {};

  function load(lang) {
    if (cache[lang]) return cache[lang];
    var promise = fetch(base + lang + '.json?v=' + VERSION)
      .then(function (res) { return res.ok ? res.json() : {}; })
      .catch(function () { return {}; });
    cache[lang] = promise;
    return promise;
  }

  function normalize(lang) {
    lang = (lang || '').slice(0, 2).toLowerCase();
    if (lang === 'nb' || lang === 'nn') lang = 'no';
    return SUPPORTED.indexOf(lang) !== -1 ? lang : FALLBACK;
  }

  function apply(dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = dict[el.getAttribute('data-i18n')];
      if (value !== undefined) el.innerHTML = value;
    });
  }

  window.setLang = function (lang) {
    lang = normalize(lang);
    return Promise.all([load(FALLBACK), load(lang)]).then(function (parts) {
      var merged = {};
      Object.assign(merged, parts[0], parts[1]);
      apply(merged);
      if (window.DV_SET_HTML_LANG !== false) {
        document.documentElement.lang = lang;
      }
      var select = document.querySelector('.lang-select');
      if (select) select.value = lang;
      try { localStorage.setItem('dv-lang', lang); } catch (e) {}
      return merged;
    });
  };

  function init() {
    var saved;
    try { saved = localStorage.getItem('dv-lang'); } catch (e) {}
    var pref = normalize(saved || navigator.language);
    var select = document.querySelector('.lang-select');
    if (select) {
      select.addEventListener('change', function () { window.setLang(this.value); });
    }
    window.setLang(pref);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
