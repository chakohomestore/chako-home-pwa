/* Chako Home Store – ürünleri products.json dosyasından okur, kategori ve arama filtresi uygular. */
(function () {
  'use strict';


  // ---- Basit, çerezsiz ziyaret ve tıklama sayacı (kişisel veri tutulmaz) ----
  var IZLEME_URL = 'https://ctnzfltmdmbiftkafmgs.supabase.co/rest/v1/olaylar';
  var IZLEME_ANAHTAR = 'sb_publishable_6kolMesBk23Wt3hoka-8sw_LaE97fZH';
  var IZLENEN_ADRESLER = ['chakohome.com.tr', 'www.chakohome.com.tr'];

  // Kendi cihazınızı saymamak için bir kez ?izleme=kapali ile açın, geri açmak için ?izleme=ac
  try {
    var izlemeParam = new URLSearchParams(location.search).get('izleme');
    if (izlemeParam === 'kapali') localStorage.setItem('chako_izleme_kapali', '1');
    if (izlemeParam === 'ac') localStorage.removeItem('chako_izleme_kapali');
  } catch (e) {}

  function izlemeAcikMi() {
    if (IZLENEN_ADRESLER.indexOf(location.hostname) === -1) return false;
    if (navigator.webdriver) return false;
    if (/bot|crawl|spider|slurp|headless|lighthouse|preview/i.test(navigator.userAgent)) return false;
    try { if (localStorage.getItem('chako_izleme_kapali')) return false; } catch (e) {}
    return true;
  }

  function izle(veri) {
    if (!izlemeAcikMi()) return;
    veri.cihaz = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'mobil' : 'masaustu';
    try {
      fetch(IZLEME_URL, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          'apikey': IZLEME_ANAHTAR,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(veri)
      }).catch(function () {});
    } catch (e) {}
  }

  function sayfaGoruntulendi() {
    var yeni = false;
    try {
      if (!sessionStorage.getItem('chako_oturum')) {
        sessionStorage.setItem('chako_oturum', '1');
        yeni = true;
      }
    } catch (e) {}
    var kaynak = null;
    try {
      if (document.referrer) {
        var h = new URL(document.referrer).hostname;
        if (h && IZLENEN_ADRESLER.indexOf(h) === -1) kaynak = h.slice(0, 60);
      }
    } catch (e) {}
    izle({ tip: 'goruntuleme', yeni_oturum: yeni, kaynak: kaynak });
  }
  // -----------------------------------------------------------------------

  var grid = document.getElementById('grid');
  var chipsBox = document.getElementById('chips');
  var statusEl = document.getElementById('status');
  var searchEl = document.getElementById('search');

  var state = { cat: 'all', q: '' };
  var data = null;
  var cards = [];

  // Türkçe harfleri sadeleştirir: "Çay" ve "cay" aynı sayılır
  function norm(s) {
    return String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

  function buildCard(p, catName) {
    var li = el('li', 'card');
    var pic = el('div', 'pic');
    var img = document.createElement('img');
    img.src = p.image;
    img.alt = p.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', function () {
      pic.textContent = '';
      pic.appendChild(el('span', 'ph', p.name));
    });
    pic.appendChild(img);

    var info = el('div', 'info');
    info.appendChild(el('p', 'cat', catName));
    info.appendChild(el('h2', '', p.name));
    info.appendChild(el('p', 'desc', p.description));

    var a = document.createElement('a');
    a.className = 'btn';
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'sponsored nofollow noopener noreferrer';
    a.setAttribute('aria-label', p.name + ' ürününü Amazon\'da incele');
    var tikla = function () { izle({ tip: 'tiklama', urun_id: p.id, kategori: p.category }); };
    a.addEventListener('click', tikla);
    a.addEventListener('auxclick', tikla);
    a.innerHTML = '<span>Amazon\'da incele</span>' + ARROW;
    info.appendChild(a);

    li.appendChild(pic);
    li.appendChild(info);
    return li;
  }

  function render() {
    var catNames = {};
    data.categories.forEach(function (c) { catNames[c.id] = c.name; });

    data.products.forEach(function (p) {
      var li = buildCard(p, catNames[p.category] || '');
      grid.appendChild(li);
      cards.push({
        el: li,
        cat: p.category,
        text: norm(p.name + ' ' + p.fullTitle + ' ' + p.description + ' ' + (catNames[p.category] || ''))
      });
    });

    buildChips();
    var fromUrl = new URLSearchParams(location.search).get('kategori');
    if (fromUrl && chipsBox.querySelector('[data-cat="' + fromUrl + '"]')) state.cat = fromUrl;
    apply();
  }

  function buildChips() {
    // Ürünü olmayan kategoriler gösterilmez; ilk ürün eklenince kendiliğinden belirir
    var used = data.categories.filter(function (c) {
      return data.products.some(function (p) { return p.category === c.id; });
    });
    var items = [{ id: 'all', name: 'Tümü' }].concat(used);
    items.forEach(function (c) {
      var count = c.id === 'all' ? data.products.length
        : data.products.filter(function (p) { return p.category === c.id; }).length;
      if (count === 0) return; // ürünü olmayan kategori sitede gösterilmez
      var b = el('button', 'chip');
      b.type = 'button';
      b.dataset.cat = c.id;
      b.appendChild(document.createTextNode(c.name));
      b.appendChild(el('span', 'n', String(count)));
      b.addEventListener('click', function () { state.cat = c.id; apply(); });
      chipsBox.appendChild(b);
    });
  }

  function apply() {
    var q = norm(state.q.trim());
    var shown = 0;
    cards.forEach(function (c) {
      var ok = (state.cat === 'all' || c.cat === state.cat) && (q === '' || c.text.indexOf(q) !== -1);
      c.el.hidden = !ok;
      if (ok) shown++;
    });

    Array.prototype.forEach.call(chipsBox.children, function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat));
    });

    var old = document.getElementById('empty');
    if (old) old.remove();
    if (shown === 0) {
      var li = el('li');
      li.id = 'empty';
      li.style.gridColumn = '1 / -1';
      var box = el('div', 'empty');
      box.appendChild(el('p', '', 'Aramanıza uyan ürün bulunamadı. Başka bir kelime deneyin.'));
      var btn = el('button', '', 'Filtreleri temizle');
      btn.type = 'button';
      btn.addEventListener('click', function () { state.cat = 'all'; state.q = ''; searchEl.value = ''; apply(); });
      box.appendChild(btn);
      li.appendChild(box);
      grid.appendChild(li);
    }
    statusEl.textContent = shown + ' ürün gösteriliyor';

    var url = new URL(location.href);
    if (state.cat === 'all') url.searchParams.delete('kategori'); else url.searchParams.set('kategori', state.cat);
    history.replaceState(null, '', url);
  }

  searchEl.addEventListener('input', function () { state.q = searchEl.value; apply(); });

  sayfaGoruntulendi();

  fetch('products.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { data = d; render(); })
    .catch(function () {
      statusEl.textContent = 'Ürünler yüklenemedi. Sayfayı yenileyip tekrar deneyin.';
    });

  // Çevrimdışı çalışma ve "ana ekrana ekle" için service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
