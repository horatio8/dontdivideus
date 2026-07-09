/* Don't Divide Us — shared chrome: header, footer, countdown, nav behaviour */
(function () {
  var page = document.body.getAttribute("data-page") || "";

  var NAV = [
    {
      label: "The Issue", key: "issue",
      items: [
        { href: "the-act.html", label: "What the Act does", key: "the-act" },
        { href: "two-victorias.html", label: "Two Victorias", key: "two-victorias" },
        { href: "the-case.html", label: "The case for repeal", key: "the-case" },
        { href: "voices.html", label: "Voices", key: "voices" },
        { href: "fact-check.html", label: "Fact check", key: "fact-check" }
      ]
    },
    {
      label: "Take Action", key: "action",
      items: [
        { href: "pledge.html", label: "Sign the pledge", key: "pledge" },
        { href: "get-involved.html", label: "Get involved", key: "get-involved" },
        { href: "your-mp.html", label: "Find your MP", key: "your-mp" },
        { href: "marginals.html", label: "Marginal seats", key: "marginals" },
        { href: "resources.html", label: "Resources", key: "resources" }
      ]
    },
    {
      label: "About", key: "aboutgrp",
      items: [
        { href: "about.html", label: "Who we are", key: "about" },
        { href: "coalition-pledge.html", label: "Coalition pledge tracker", key: "coalition-pledge" },
        { href: "media.html", label: "Media centre", key: "media" },
        { href: "contact.html", label: "Contact", key: "contact" }
      ]
    }
  ];

  function cur(key) { return key === page ? ' aria-current="page"' : ""; }

  var navHtml = NAV.map(function (item) {
    if (item.items) {
      var open = item.items.some(function (s) { return s.key === page; });
      return '<div class="nav__group">' +
        '<button type="button" aria-expanded="false"' + (open ? ' class="in-section"' : '') + '>' + item.label + ' <span class="caret">&#9660;</span></button>' +
        '<div class="nav__menu">' + item.items.map(function (s) {
          return '<a href="' + s.href + '"' + cur(s.key) + '>' + s.label + '</a>';
        }).join("") + '</div></div>';
    }
    return '<a class="nav__link" href="' + item.href + '"' + cur(item.key) + '>' + item.label + '</a>';
  }).join("");

  var headerHtml =
    '<a class="skip-link" href="#main">Skip to content</a>' +
    '<div class="site-header__inner">' +
      '<a class="brand" href="index.html" aria-label="Don\u2019t Divide Us home">' +
        '<img src="assets/ddu-logo-transparent.png" alt="Don\u2019t Divide Us \u2014 Australia map logo">' +
      '</a>' +
      '<nav class="nav" aria-label="Primary">' + navHtml + '</nav>' +
      '<div class="header-ctas">' +
        '<a class="btn btn--sand btn--sm" href="pledge.html">Sign the petition</a>' +
        '<a class="btn btn--red btn--sm" href="donate.html">Donate</a>' +
        '<button class="hamburger" type="button" aria-label="Open menu" aria-expanded="false">&#9776;</button>' +
      '</div>' +
    '</div>' +
    '<nav class="mobile-nav" aria-label="Mobile">' +
      '<a href="index.html">Home</a>' +
      '<p class="mnav-h">The issue</p>' +
      '<a href="the-act.html">What the Act does</a>' +
      '<a href="two-victorias.html">Two Victorias</a>' +
      '<a href="the-case.html">The case for repeal</a>' +
      '<a href="voices.html">Voices</a>' +
      '<a href="fact-check.html">Fact check</a>' +
      '<p class="mnav-h">Take action</p>' +
      '<a href="pledge.html">Sign the pledge</a>' +
      '<a href="get-involved.html">Get involved</a>' +
      '<a href="your-mp.html">Find your MP</a>' +
      '<a href="marginals.html">Marginal seats</a>' +
      '<a href="resources.html">Resources</a>' +
      '<p class="mnav-h">About</p>' +
      '<a href="about.html">Who we are</a>' +
      '<a href="coalition-pledge.html">Coalition pledge tracker</a>' +
      '<a href="media.html">Media centre</a>' +
      '<a href="contact.html">Contact</a>' +
      '<a href="donate.html" style="color:#f0c9cb">Donate</a>' +
    '</nav>';

  var footerHtml =
    '<div class="footer-main">' +
      '<div class="footer-brand">' +
        '<img src="assets/ddu-logo-transparent.png" alt="">' +
        '<p>A campaign for one Victoria, where every citizen stands equal before the law.</p>' +
      '</div>' +
      '<div><h4>The issue</h4><ul>' +
        '<li><a href="the-act.html">What the Act does</a></li>' +
        '<li><a href="two-victorias.html">Two Victorias</a></li>' +
        '<li><a href="the-case.html">The case for repeal</a></li>' +
        '<li><a href="voices.html">Voices</a></li>' +
        '<li><a href="fact-check.html">Fact check</a></li>' +
      '</ul></div>' +
      '<div><h4>Take action</h4><ul>' +
        '<li><a href="pledge.html">Sign the pledge</a></li>' +
        '<li><a href="donate.html">Donate</a></li>' +
        '<li><a href="get-involved.html">Get involved</a></li>' +
        '<li><a href="your-mp.html">Find your MP</a></li>' +
        '<li><a href="marginals.html">Marginal seats</a></li>' +
        '<li><a href="resources.html">Resources</a></li>' +
        '<li><a href="share.html">Share the campaign</a></li>' +
      '</ul></div>' +
      '<div><h4>About</h4><ul>' +
        '<li><a href="about.html">Who we are</a></li>' +
        '<li><a href="media.html">Media centre</a></li>' +
        '<li><a href="coalition-pledge.html">Coalition pledge tracker</a></li>' +
        '<li><a href="contact.html">Contact</a></li>' +
        '<li><a href="privacy.html">Privacy</a></li>' +
        '<li><a href="donations-policy.html">Donations policy</a></li>' +
        '<li><a href="editorial-standard.html">Editorial standard</a></li>' +
        '<li><a href="complaints.html">Complaints</a></li>' +
      '</ul></div>' +
    '</div>' +
    '<div class="footer-news"><div class="footer-news__inner">' +
      '<div><strong>Stay across the campaign.</strong> One email a week. No spam.</div>' +
      '<form data-newsletter><label class="sr-only" for="nl-email" style="position:absolute;left:-9999px">Email</label>' +
      '<input id="nl-email" type="email" placeholder="Your email" required>' +
      '<button class="btn btn--sand btn--sm" type="submit">Subscribe</button></form>' +
    '</div></div>' +
    '<div class="footer-legal"><div class="footer-legal__inner">' +
      '<p>Don\u2019t Divide Us acknowledges the contribution of every Victorian \u2014 of every background and ancestry \u2014 to the state we share, and campaigns for laws that treat all of us as equals.</p>' +
      '<p>Donations to Don\u2019t Divide Us are not tax deductible. \u00a9 2026 Don\u2019t Divide Us. <a href="privacy.html">Privacy</a> \u00b7 <a href="donations-policy.html">Donations policy</a> \u00b7 <a href="complaints.html">Complaints</a> \u00b7 <a href="media.html">Media enquiries</a></p>' +
    '</div></div>';

  var headerEl = document.querySelector("[data-ddu-header]");
  if (headerEl) { headerEl.className = "site-header"; headerEl.innerHTML = headerHtml; }
  var footerEl = document.querySelector("[data-ddu-footer]");
  if (footerEl) { footerEl.className = "site-footer"; footerEl.innerHTML = footerHtml; }

  // Dropdowns
  document.querySelectorAll(".nav__group > button").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var group = btn.parentElement;
      var was = group.classList.contains("open");
      document.querySelectorAll(".nav__group.open").forEach(function (g) { g.classList.remove("open"); });
      if (!was) group.classList.add("open");
      btn.setAttribute("aria-expanded", String(!was));
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".nav__group.open").forEach(function (g) { g.classList.remove("open"); });
  });

  // Hamburger
  var ham = document.querySelector(".hamburger");
  if (ham) {
    ham.addEventListener("click", function () {
      var m = document.querySelector(".mobile-nav");
      var open = m.classList.toggle("open");
      ham.setAttribute("aria-expanded", String(open));
    });
  }

  // Countdown to Victorian state election — Saturday 28 November 2026
  var ELECTION = new Date(2026, 10, 28);
  var days = Math.max(0, Math.ceil((ELECTION - new Date()) / 86400000));
  document.querySelectorAll("[data-countdown-days]").forEach(function (el) {
    el.textContent = days;
  });

  // Newsletter mock
  document.querySelectorAll("[data-newsletter]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.innerHTML = '<span style="color:#e3d3a6;font-weight:700">Thanks — check your inbox to confirm.</span>';
    });
  });
})();

/* ============================================================
   First-party attribution capture + Share Click beacon
   Runs on every page. First-touch values win and are never
   overwritten. All network calls are fire-and-forget: if the
   /api backend isn't deployed yet, nothing breaks.
   ============================================================ */
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
    "fbclid", "gclid", "ttclid", "li_fat_id", "msclkid", "twclid", "sccid",
    "ad_id", "adset_id", "campaign_id", "placement", "ref"];
  try {
    var params = new URLSearchParams(window.location.search);
    var store = JSON.parse(sessionStorage.getItem("ddu_attr") || "{}");
    var touched = false;
    KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v && !store[k]) { store[k] = v; touched = true; }
    });
    if (!store.landing_url) {
      store.landing_url = window.location.href;
      store.landing_referrer = document.referrer || "";
      store.landing_at = new Date().toISOString();
      touched = true;
    }
    if (!store._fbp) {
      var m = document.cookie.match(/(?:^|;\s*)_fbp=([^;]+)/);
      if (m) { store._fbp = m[1]; touched = true; }
    }
    if (touched) sessionStorage.setItem("ddu_attr", JSON.stringify(store));

    // Share Click beacon — once per ref per session
    var ref = params.get("ref") || store.ref;
    if (ref) {
      var flag = "ddu_ref_click_" + ref;
      if (!sessionStorage.getItem(flag)) {
        sessionStorage.setItem(flag, "1");
        try {
          fetch("/api/share-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ref: ref, source_url: window.location.href, fbclid: store.fbclid || "" }),
            keepalive: true
          }).catch(function () {});
        } catch (e) {}
      }
    }
  } catch (e) {}
})();

/* ============================================================
   Social-proof activity popup
   Bottom-right "someone just signed / donated" toast. Hidden on
   conversion pages. Listens for real petition-signed /
   donation-completed CustomEvents, with a curated idle fallback
   pool (representative sample copy — never stored signer data).
   ============================================================ */
(function () {
  var path = window.location.pathname;
  var base = (path.substring(path.lastIndexOf("/") + 1) || "index.html").replace(/[?#].*$/, "");
  // Suppress on conversion surfaces (donate flow, share, the petition itself)
  if (/^(donate|donate-success|donate-cancelled|share|pledge|petition)(\.html)?$/.test(base)) return;

  var NAMES = ["Sarah", "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "Jack",
    "Chloe", "Thomas", "Grace", "Lachlan", "Ruby", "Ethan", "Isla", "Oliver",
    "Mia", "William", "Sophie", "Harry", "Charlotte", "Cooper", "Zoe", "Amelia",
    "Riley", "Ella", "Max", "Lily", "George", "Evie"];
  var PLACES = ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton",
    "Frankston", "Dandenong", "Werribee", "Mildura", "Warrnambool", "Wodonga",
    "Traralgon", "Cranbourne", "Pakenham", "Sunbury", "Melton", "Wangaratta",
    "Horsham", "Sale", "Bairnsdale"];
  var AMOUNTS = [50, 75, 100, 150, 200];

  function rnd(a) { return a[Math.floor(Math.random() * a.length)]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function petitionItem(name) {
    return { type: "petition", text: name + " from " + rnd(PLACES) + " just signed the pledge for one Victoria.", cta: "Add your name", href: "pledge.html" };
  }
  function donationItem(name, amount) {
    return { type: "donation", text: name + " from " + rnd(PLACES) + " just chipped in $" + amount + " to keep Victoria equal.", cta: "Chip in today", href: "donate.html" };
  }
  function idleItem() {
    return Math.random() < 0.75 ? petitionItem(rnd(NAMES)) : donationItem(rnd(NAMES), rnd(AMOUNTS));
  }

  var current = null, hideTimer = null;

  function clear() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (current && current.parentNode) current.parentNode.removeChild(current);
    current = null;
  }
  function dismiss() {
    if (!current) return;
    var el = current; current = null;
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    el.classList.remove("ddu-sp--in");
    el.classList.add("ddu-sp--out");
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 400);
  }
  function show(item) {
    clear(); // a new item replaces whatever is showing — no backlog
    var a = document.createElement("a");
    a.href = item.href;
    a.className = "ddu-sp ddu-sp--" + item.type;
    a.setAttribute("role", "status");
    var icon = item.type === "petition" ? "✓" : "❤";
    a.innerHTML =
      '<span class="ddu-sp__icon" aria-hidden="true">' + icon + "</span>" +
      '<span class="ddu-sp__body"><span class="ddu-sp__text">' + esc(item.text) + "</span>" +
      '<span class="ddu-sp__cta">' + esc(item.cta) + "</span></span>" +
      '<button class="ddu-sp__close" type="button" aria-label="Dismiss">×</button>';
    a.querySelector(".ddu-sp__close").addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation(); dismiss();
    });
    document.body.appendChild(a);
    current = a;
    requestAnimationFrame(function () { if (current === a) a.classList.add("ddu-sp--in"); });
    hideTimer = setTimeout(dismiss, 9000);
  }

  // Real form-success events (fired by petition / donation success handlers)
  window.addEventListener("petition-signed", function (e) {
    var first = (e.detail && e.detail.first) ? e.detail.first : rnd(NAMES);
    show(petitionItem(first));
  });
  window.addEventListener("donation-completed", function (e) {
    var amt = e.detail && Number(e.detail.amount);
    if (!(amt >= 50)) return; // only surface meaningful gifts
    var first = (e.detail && e.detail.first) ? e.detail.first : rnd(NAMES);
    show(donationItem(first, amt));
  });

  // Idle cadence: first after ~8s, then one/min, only while tab is visible
  function tick() { if (!document.hidden) show(idleItem()); }
  setTimeout(function () { tick(); setInterval(tick, 60000); }, 8000);
})();
