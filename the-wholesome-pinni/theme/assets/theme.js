/* ==========================================================================
   The Wholesome Pinni – theme.js
   Vanilla JS, no dependencies. Loaded with defer.
   ========================================================================== */
(function () {
  'use strict';

  var theme = window.theme || {};
  var strings = theme.strings || {};
  var designMode = !!(window.Shopify && window.Shopify.designMode);

  /* ---------- Helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts); }
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }
  function sectionIdOf(el) {
    var wrap = el.closest('.shopify-section');
    return wrap ? wrap.id.replace('shopify-section-', '') : null;
  }
  function parseHTML(html) { return new DOMParser().parseFromString(html, 'text/html'); }
  function toast(msg) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('is-visible'); }, 3200);
  }
  function formatMoney(amount) {
    var value = parseFloat(amount).toFixed(2);
    var fmt = theme.moneyFormat || '£{{amount}}';
    return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, function (m, key) {
      if (key === 'amount_no_decimals') return Math.round(parseFloat(amount)).toString();
      if (key === 'amount_with_comma_separator') return value.replace('.', ',');
      return value;
    }).replace(/<[^>]*>/g, '');
  }
  function lockScroll(lock) { document.body.classList.toggle('is-locked', lock); }

  /* Focus trap for dialogs */
  var focusableSel = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  function trapFocus(container, e) {
    if (e.key !== 'Tab') return;
    var items = $$(focusableSel, container).filter(function (n) { return n.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* Generic slide-in panel (mobile nav, search, cart drawer) */
  function Panel(root, opts) {
    this.root = root;
    this.opts = opts || {};
    this.lastFocus = null;
    var self = this;
    this._key = function (e) {
      if (e.key === 'Escape') self.close();
      trapFocus(self.root, e);
    };
  }
  Panel.prototype.open = function (trigger) {
    var self = this;
    this.lastFocus = trigger || document.activeElement;
    this.root.hidden = false;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { self.root.classList.add('is-open'); });
    });
    lockScroll(true);
    document.addEventListener('keydown', this._key);
    $$('[aria-controls="' + this.root.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    setTimeout(function () {
      var f = self.opts.focus ? $(self.opts.focus, self.root) : $('[role="dialog"]', self.root);
      if (f) f.focus();
    }, 60);
  };
  Panel.prototype.close = function () {
    var self = this;
    if (this.root.hidden) return;
    this.root.classList.remove('is-open');
    lockScroll(false);
    document.removeEventListener('keydown', this._key);
    $$('[aria-controls="' + this.root.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    setTimeout(function () { self.root.hidden = true; }, 380);
    if (this.lastFocus && this.lastFocus.focus) this.lastFocus.focus();
  };

  /* ---------- Announcement bar ---------- */
  function initAnnouncement() {
    $$('[data-announcement]').forEach(function (bar) {
      var items = $$('.announcement__item', bar);
      if (items.length < 2) return;
      var i = 0, interval = parseInt(bar.dataset.interval, 10) || 5000, timer;
      function next() {
        items[i].classList.remove('is-active'); items[i].setAttribute('aria-hidden', 'true');
        i = (i + 1) % items.length;
        items[i].classList.add('is-active'); items[i].removeAttribute('aria-hidden');
      }
      function start() { if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(next, interval); }
      start();
      on(bar, 'mouseenter', function () { clearInterval(timer); });
      on(bar, 'mouseleave', start);
    });
  }

  /* ---------- Header ---------- */
  function initHeader() {
    var header = $('[data-header]');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
      on(window, 'scroll', onScroll, { passive: true });
      onScroll();
    }

    // Desktop dropdowns: keyboard + touch support
    $$('[data-dropdown]').forEach(function (item) {
      var link = $('.nav__link', item);
      function set(open) { item.classList.toggle('is-open', open); link.setAttribute('aria-expanded', open ? 'true' : 'false'); }
      on(item, 'mouseenter', function () { set(true); });
      on(item, 'mouseleave', function () { set(false); });
      on(item, 'focusout', function (e) { if (!item.contains(e.relatedTarget)) set(false); });
      on(link, 'click', function (e) {
        // On touch devices the first tap opens the dropdown
        if (window.matchMedia('(hover: none)').matches && !item.classList.contains('is-open')) { e.preventDefault(); set(true); }
      });
      on(item, 'keydown', function (e) { if (e.key === 'Escape') { set(false); link.focus(); } });
    });

    // Mobile nav
    var mnavEl = $('[data-mnav]');
    if (mnavEl) {
      var mnav = new Panel(mnavEl, { focus: '.mnav__panel' });
      $$('[data-mnav-open]').forEach(function (b) { on(b, 'click', function () { mnav.open(b); }); });
      $$('[data-mnav-close]', mnavEl).forEach(function (b) { on(b, 'click', function () { mnav.close(); }); });
      on(window, 'resize', debounce(function () { if (window.innerWidth >= 990) mnav.close(); }, 150));
    }

    // Search modal
    var searchEl = $('[data-search-modal]');
    if (searchEl) {
      var search = new Panel(searchEl, { focus: '[data-predictive-input]' });
      $$('[data-search-open]').forEach(function (b) { on(b, 'click', function () { search.open(b); }); });
      $$('[data-search-close]', searchEl).forEach(function (b) { on(b, 'click', function () { search.close(); }); });
      initPredictiveSearch(searchEl);
    }
  }

  /* ---------- Predictive search ---------- */
  function initPredictiveSearch(root) {
    var input = $('[data-predictive-input]', root);
    var results = $('[data-predictive-results]', root);
    var suggest = $('[data-search-suggest]', root);
    if (!input || !results) return;
    var controller;

    function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }

    var run = debounce(function () {
      var q = input.value.trim();
      if (q.length < 2) { results.innerHTML = ''; if (suggest) suggest.hidden = false; return; }
      if (controller) controller.abort();
      controller = 'AbortController' in window ? new AbortController() : null;
      var url = (theme.routes.predictiveSearch || '/search/suggest') + '.json?q=' + encodeURIComponent(q) +
        '&resources[type]=product,page&resources[limit]=6&resources[options][unavailable_products]=last';
      fetch(url, controller ? { signal: controller.signal } : {})
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (suggest) suggest.hidden = true;
          var res = (data && data.resources && data.resources.results) || {};
          var products = res.products || [];
          var pages = res.pages || [];
          if (!products.length && !pages.length) {
            results.innerHTML = '<p class="predictive__empty">' + esc(strings.noResults) + '</p>';
            return;
          }
          var html = '<ul class="predictive__list" role="list">';
          products.forEach(function (p) {
            var img = p.featured_image && p.featured_image.url
              ? '<img src="' + esc(p.featured_image.url) + (p.featured_image.url.indexOf('?') > -1 ? '&' : '?') + 'width=120" alt="' + esc(p.featured_image.alt || p.title) + '" width="56" height="56" loading="lazy">'
              : '<img alt="" width="56" height="56">';
            var price = parseFloat(p.price) > 0 ? '<span class="predictive__price">' + esc(formatMoney(p.price)) + '</span>' : '';
            html += '<li><a class="predictive__item" href="' + esc(p.url) + '">' + img +
              '<span><span class="predictive__title">' + esc(p.title) + '</span><br>' + price + '</span></a></li>';
          });
          pages.forEach(function (p) {
            html += '<li><a class="predictive__item" href="' + esc(p.url) + '"><span class="predictive__title">' + esc(p.title) + '</span></a></li>';
          });
          html += '</ul><a class="link-arrow predictive__all" href="' + theme.routes.search + '?type=product&q=' + encodeURIComponent(q) + '">' + esc(strings.viewAll) + ' →</a>';
          results.innerHTML = html;
        })
        .catch(function () {});
    }, 250);

    on(input, 'input', run);
  }

  /* ---------- Hero slider ---------- */
  function initSliders() {
    $$('[data-slider]').forEach(function (slider) {
      var slides = $$('[data-slide]', slider);
      var dots = $$('[data-slider-dot]', slider);
      if (slides.length < 2) return;
      var i = 0, timer = null;
      var interval = parseInt(slider.dataset.interval, 10) || 6000;
      var autoplay = slider.dataset.autoplay === 'true' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      function go(n) {
        slides[i].classList.remove('is-active');
        if (dots[i]) { dots[i].classList.remove('is-active'); dots[i].removeAttribute('aria-current'); }
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active');
        if (dots[i]) { dots[i].classList.add('is-active'); dots[i].setAttribute('aria-current', 'true'); }
      }
      function start() { if (autoplay && !designMode) { stop(); timer = setInterval(function () { go(i + 1); }, interval); } }
      function stop() { clearInterval(timer); }

      on($('[data-slider-prev]', slider), 'click', function () { go(i - 1); start(); });
      on($('[data-slider-next]', slider), 'click', function () { go(i + 1); start(); });
      dots.forEach(function (d) { on(d, 'click', function () { go(parseInt(d.dataset.sliderDot, 10)); start(); }); });
      on(slider, 'mouseenter', stop);
      on(slider, 'mouseleave', start);
      on(slider, 'focusin', stop);
      on(slider, 'focusout', start);

      // Swipe
      var x0 = null;
      on(slider, 'touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      on(slider, 'touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) { go(dx < 0 ? i + 1 : i - 1); start(); }
        x0 = null;
      });

      // Theme editor: show the selected block
      on(document, 'shopify:block:select', function (e) {
        var idx = slides.findIndex(function (s) { return s.contains(e.target) || s === e.target; });
        if (idx > -1) { stop(); go(idx); }
      });
      start();
    });
  }

  /* ---------- Scroll animations ---------- */
  function initAnimations(ctx) {
    var els = $$('[data-animate]:not(.is-visible)', ctx);
    if (!document.body.classList.contains('has-animations') || designMode || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Cart ---------- */
  var Cart = {
    drawer: null,
    panel: null,

    init: function () {
      this.drawer = $('[data-cart-drawer]');
      if (this.drawer) {
        this.panel = new Panel(this.drawer, { focus: '.drawer__panel' });
        var self = this;
        $$('[data-cart-open]').forEach(function (a) {
          on(a, 'click', function (e) { e.preventDefault(); self.panel.open(a); });
        });
        on(this.drawer, 'click', function (e) {
          if (e.target.closest('[data-cart-close]')) self.panel.close();
        });
        this.bindLines(this.drawer, 'cart-drawer');
      }
      var page = $('[data-cart-page]');
      if (page) {
        var wrap = page.closest('.shopify-section') || page;
        this.bindLines(wrap, sectionIdOf(page));
        on(wrap, 'input', debounce(function (e) {
          var note = e.target.closest('[data-cart-note]');
          if (!note) return;
          fetch(theme.routes.cartUpdate + '.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ note: note.value })
          });
        }, 400));
      }
    },

    sectionsToRender: function (extra) {
      var list = [];
      if (this.drawer) list.push('cart-drawer');
      if (extra && list.indexOf(extra) === -1) list.push(extra);
      return list;
    },

    bindLines: function (root, sectionId) {
      var self = this;
      on(root, 'click', function (e) {
        var btn = e.target.closest('[data-cart-qty]');
        if (!btn) return;
        e.preventDefault();
        var line = btn.closest('[data-line]');
        self.change(parseInt(line.dataset.line, 10), parseInt(btn.dataset.cartQty, 10), sectionId);
      });
      on(root, 'change', function (e) {
        var input = e.target.closest('[data-cart-input]');
        if (!input) return;
        var line = input.closest('[data-line]');
        self.change(parseInt(line.dataset.line, 10), Math.max(0, parseInt(input.value, 10) || 0), sectionId);
      });
    },

    change: function (line, quantity, sectionId) {
      var self = this;
      var sections = this.sectionsToRender(sectionId);
      if (this.drawer) this.drawer.classList.add('is-loading');
      fetch(theme.routes.cartChange + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: quantity, sections: sections, sections_url: window.location.pathname })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          if (cart.status && cart.description) { toast(cart.description); return; }
          self.render(cart.sections);
          self.updateCount(cart.item_count);
        })
        .catch(function () { toast(strings.error); })
        .finally(function () { if (self.drawer) self.drawer.classList.remove('is-loading'); });
    },

    add: function (form, button) {
      var self = this;
      var label = button ? $('[data-add-label]', button) : null;
      var original = label ? label.textContent : '';
      var errorEl = $('[data-form-error]', form);
      if (errorEl) errorEl.hidden = true;
      if (button) { button.classList.add('is-loading'); button.setAttribute('aria-busy', 'true'); }
      if (label) label.textContent = strings.adding;

      var fd = new FormData(form);
      var sections = this.sectionsToRender();
      if (sections.length) {
        fd.append('sections', sections.join(','));
        fd.append('sections_url', window.location.pathname);
      }

      fetch(theme.routes.cartAdd + '.js', { method: 'POST', headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, body: fd })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.status) {
            var msg = res.description || res.message || strings.error;
            if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; } else { toast(msg); }
            return;
          }
          if (theme.cartType === 'page' || !self.drawer) {
            window.location.href = theme.routes.cart;
            return;
          }
          self.render(res.sections);
          return fetch(theme.routes.cart + '.js', { headers: { Accept: 'application/json' } })
            .then(function (r) { return r.json(); })
            .then(function (cart) {
              self.updateCount(cart.item_count, true);
              self.panel.open(button);
            });
        })
        .catch(function () { toast(strings.error); })
        .finally(function () {
          if (button) { button.classList.remove('is-loading'); button.removeAttribute('aria-busy'); }
          if (label) label.textContent = original;
        });
    },

    render: function (sections) {
      if (!sections) return;
      Object.keys(sections).forEach(function (id) {
        var html = sections[id];
        if (!html) return;
        var doc = parseHTML(html);
        if (id === 'cart-drawer') {
          var fresh = $('.drawer__panel', doc);
          var current = $('[data-cart-drawer] .drawer__panel');
          if (fresh && current) {
            current.innerHTML = fresh.innerHTML;
          }
        } else {
          var target = document.getElementById('shopify-section-' + id);
          var src = $('#shopify-section-' + id, doc) || doc.body;
          if (target && src) {
            target.innerHTML = src.innerHTML;
            initAnimations(target);
          }
        }
      });
    },

    updateCount: function (count, bump) {
      $$('[data-cart-count]').forEach(function (el) {
        el.textContent = count;
        el.classList.toggle('is-empty', count === 0);
        if (bump) {
          el.classList.add('bump');
          setTimeout(function () { el.classList.remove('bump'); }, 300);
        }
      });
    }
  };

  /* Add-to-cart forms (product page + cards) */
  function initProductForms() {
    on(document, 'submit', function (e) {
      var form = e.target.closest('[data-product-form]');
      if (!form) return;
      e.preventDefault();
      var btn = $('[data-add-button]', form);
      if (btn && btn.disabled) return;
      Cart.add(form, btn);
    });
  }

  /* ---------- Product page ---------- */
  function initProduct(section) {
    var jsonEl = $('[data-product-json]', section);
    if (!jsonEl) return;
    var data;
    try { data = JSON.parse(jsonEl.textContent); } catch (err) { return; }
    var variants = data.variants || [];
    var idInput = $('[data-variant-id]', section);
    var addBtn = $('[data-add-button]', section);
    var addLabel = addBtn ? $('[data-add-label]', addBtn) : null;
    var dynamic = $('[data-dynamic-checkout]', section);
    var priceWrap = $('[data-price-wrap] [data-price]', section);
    var stockEl = $('[data-stock]', section);
    var picker = $('[data-variant-picker]', section);

    /* Gallery */
    var slides = $$('.product__slide', section);
    var thumbs = $$('[data-thumb]', section);
    function showMedia(id) {
      if (!id) return;
      var found = false;
      slides.forEach(function (s) {
        var match = String(s.dataset.mediaId) === String(id);
        s.classList.toggle('is-active', match);
        if (match) found = true;
      });
      if (!found && slides[0]) slides[0].classList.add('is-active');
      thumbs.forEach(function (t) {
        var match = String(t.dataset.thumb) === String(id);
        t.classList.toggle('is-active', match);
        if (match) { t.setAttribute('aria-current', 'true'); } else { t.removeAttribute('aria-current'); }
      });
    }
    thumbs.forEach(function (t) { on(t, 'click', function () { showMedia(t.dataset.thumb); }); });

    // Swipe main image on touch
    var main = $('[data-gallery-main]', section);
    if (main && slides.length > 1) {
      var x0 = null;
      on(main, 'touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      on(main, 'touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0;
        x0 = null;
        if (Math.abs(dx) < 40) return;
        var idx = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
        var next = slides[(idx + (dx < 0 ? 1 : -1) + slides.length) % slides.length];
        showMedia(next.dataset.mediaId);
      });
    }

    // Hover zoom (desktop pointers only)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.product__zoom', section).forEach(function (z) {
        on(z, 'mousemove', function (e) {
          var r = z.getBoundingClientRect();
          z.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%');
          z.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%');
        });
        on(z, 'mouseenter', function () { z.classList.add('is-zoomed'); });
        on(z, 'mouseleave', function () { z.classList.remove('is-zoomed'); });
      });
    }

    /* Quantity */
    var qtyInput = $('.product-form .qty__input', section);
    on($('[data-qty-minus]', section), 'click', function () { qtyInput.value = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1); });
    on($('[data-qty-plus]', section), 'click', function () { qtyInput.value = (parseInt(qtyInput.value, 10) || 1) + 1; });

    /* Variant selection */
    if (!picker) return;

    function selectedOptions() {
      return $$('fieldset', picker).map(function (fs) {
        var c = $('input:checked', fs);
        return c ? c.value : null;
      });
    }

    function markAvailability(selected) {
      // Mark option values that would lead to a sold-out/nonexistent variant, given other selections
      $$('fieldset', picker).forEach(function (fs, idx) {
        $$('input', fs).forEach(function (input) {
          var test = selected.slice();
          test[idx] = input.value;
          var v = variants.find(function (x) { return x.options.every(function (o, j) { return o === test[j]; }); });
          var label = $('label[for="' + input.id + '"]', fs);
          if (label) label.classList.toggle('is-unavailable', !v || !v.available);
        });
      });
    }

    function renderStock(v) {
      if (!stockEl) return;
      var state = 'in', text = strings.inStock;
      if (!v || !v.available) { state = 'out'; text = v ? strings.outOfStock : strings.unavailable; }
      else if (v.tracked && theme.showLowStock && v.qty <= theme.lowStockThreshold) {
        state = 'low'; text = strings.lowStock.replace('[count]', v.qty);
      }
      stockEl.className = 'stock stock--' + state;
      $('[data-stock-text]', stockEl).textContent = text;
    }

    function renderPrice(v) {
      if (!priceWrap || !v) return;
      var onSale = v.compare_at_price > v.price && v.price > 0;
      var html;
      if (v.price <= 0) {
        html = '<span class="price__soon">' + (strings.priceSoon || '') + '</span>';
      } else {
        html = '<span class="price__current">' + v.price_html + '</span>';
        if (onSale) html += '<s class="price__compare">' + v.compare_html + '</s><span class="badge badge--sale">' + (strings.sale || 'Sale') + '</span>';
      }
      priceWrap.innerHTML = html;
      priceWrap.classList.toggle('price--on-sale', onSale);
    }

    function update() {
      var selected = selectedOptions();
      selected.forEach(function (val, idx) {
        var lbl = $('[data-option-value="' + idx + '"]', picker);
        if (lbl) lbl.textContent = val;
      });
      var v = variants.find(function (x) { return x.options.every(function (o, j) { return o === selected[j]; }); });
      markAvailability(selected);
      renderStock(v);
      renderPrice(v);
      var buyable = !!(v && v.available && v.price > 0);
      if (addBtn) {
        addBtn.disabled = !buyable;
        if (addLabel) addLabel.textContent = buyable ? strings.addToCart : (v ? strings.soldOut : strings.unavailable);
      }
      if (dynamic) dynamic.classList.toggle('is-hidden', !buyable);
      if (!v) return;
      if (idInput) idInput.value = v.id;
      if (v.featured_media) showMedia(v.featured_media);
      if (!designMode && window.history && history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', v.id);
        history.replaceState({}, '', url.toString());
      }
    }

    on(picker, 'change', update);
    markAvailability(selectedOptions());
  }

  /* Card variant selects: keep price in sync */
  function initCardSelects() {
    on(document, 'change', function (e) {
      var sel = e.target.closest('[data-card-variant]');
      if (!sel) return;
      var card = sel.closest('.card');
      var opt = sel.options[sel.selectedIndex];
      var cur = card ? $('.price__current', card) : null;
      if (cur && opt && opt.dataset.price) cur.innerHTML = opt.dataset.price;
      var cmp = card ? $('.price__compare', card) : null;
      if (cmp) cmp.remove();
    });
  }

  /* ---------- Recommendations ---------- */
  function initRecommendations() {
    $$('[data-recommendations]').forEach(function (el) {
      var url = el.dataset.url;
      if (!url) return;
      fetch(url)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = parseHTML(html);
          var grid = $('[data-recommendations-grid]', doc);
          var target = $('[data-recommendations-grid]', el);
          if (grid && target && grid.children.length) {
            target.innerHTML = grid.innerHTML;
            initAnimations(target);
          }
        })
        .catch(function () {});
    });
  }

  /* ---------- Collection facets ---------- */
  function initFacets() {
    var form = $('[data-facet-form]');
    if (!form) return;
    function submit() {
      var params = new URLSearchParams();
      new FormData(form).forEach(function (val, key) { if (val !== '') params.append(key, val); });
      window.location.href = form.getAttribute('action') + '?' + params.toString();
    }
    on(form, 'change', function (e) { if (e.target.matches('[data-facet-input]')) submit(); });
    on(form, 'submit', function (e) { e.preventDefault(); submit(); });
    // Close filter panel on outside click
    var drawer = $('[data-facets-drawer]', form);
    if (drawer) {
      on(document, 'click', function (e) { if (drawer.open && !drawer.contains(e.target)) drawer.open = false; });
    }
  }

  /* ---------- Init ---------- */
  function init() {
    strings.priceSoon = strings.priceSoon || 'Price coming soon';
    strings.sale = strings.sale || 'Sale';
    initAnnouncement();
    initHeader();
    initSliders();
    initAnimations();
    Cart.init();
    initProductForms();
    initCardSelects();
    $$('[data-product-section]').forEach(initProduct);
    initRecommendations();
    initFacets();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Theme editor support
  on(document, 'shopify:section:load', function (e) {
    initAnimations(e.target);
    if ($('[data-slider]', e.target)) initSliders();
    if ($('[data-announcement]', e.target)) initAnnouncement();
    $$('[data-product-section]', e.target).forEach(initProduct);
    if ($('[data-cart-drawer]', e.target)) Cart.init();
  });
})();
