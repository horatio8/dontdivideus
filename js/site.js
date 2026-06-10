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
        '<a class="btn btn--ghost-light btn--sm" href="pledge.html">Sign the pledge</a>' +
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
      '</ul></div>' +
      '<div><h4>About</h4><ul>' +
        '<li><a href="about.html">Who we are</a></li>' +
        '<li><a href="media.html">Media centre</a></li>' +
        '<li><a href="coalition-pledge.html">Coalition pledge tracker</a></li>' +
        '<li><a href="contact.html">Contact</a></li>' +
        '<li><a href="privacy.html">Privacy</a></li>' +
        '<li><a href="donations-policy.html">Donations policy</a></li>' +
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
      '<p class="auth">Authorised by [Authoriser name], Don\u2019t Divide Us, Melbourne, Victoria.</p>' +
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
