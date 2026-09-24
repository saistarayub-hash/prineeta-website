(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  var proof = document.querySelector("[data-proof]");
  var hideProof = document.querySelector("[data-proof-hide]");

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
    document.body.classList.remove("nav-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("nav-open", open);
      if (!open) toggle.focus();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  document.querySelectorAll("[data-nav-group]").forEach(function (group) {
    var btn = group.querySelector(".nav-parent");
    var sub = group.querySelector(".subnav");
    if (!btn || !sub) return;
    btn.addEventListener("click", function (e) {
      var isDesktop = window.matchMedia("(min-width: 1121px)").matches;
      if (isDesktop) return;
      e.preventDefault();
      var open = !group.classList.contains("is-open");
      group.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    sub.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 1120px)").matches) closeNav();
      });
    });
  });

  try {
    if (proof && window.localStorage.getItem("prinita-proof-hidden") === "1") {
      proof.remove();
    }
  } catch (error) {
    /* storage can be blocked; the bar can stay */
  }

  if (hideProof && proof) {
    hideProof.addEventListener("click", function () {
      try {
        window.localStorage.setItem("prinita-proof-hidden", "1");
      } catch (error) {
        /* ignore */
      }
      proof.remove();
    });
  }

  function activate(root, tab) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (item) {
      var on = item === tab;
      item.setAttribute("aria-selected", on ? "true" : "false");
      item.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(item.getAttribute("aria-controls"));
      if (panel) panel.classList.toggle("is-active", on);
    });
  }

  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;

    var hash = window.location.hash.replace("#", "");
    var initial = tabs.find(function (tab) {
      return tab.getAttribute("data-hash") === hash;
    }) || tabs[0];
    activate(root, initial);

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(root, tab);
        if (tab.getAttribute("data-hash")) {
          history.replaceState(null, "", "#" + tab.getAttribute("data-hash"));
        }
      });

      tab.addEventListener("keydown", function (event) {
        var next = null;
        if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
        if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === "Home") next = tabs[0];
        if (event.key === "End") next = tabs[tabs.length - 1];
        if (!next) return;
        event.preventDefault();
        next.focus();
        activate(root, next);
        if (next.getAttribute("data-hash")) {
          history.replaceState(null, "", "#" + next.getAttribute("data-hash"));
        }
      });
    });
  });

  var form = document.querySelector("[data-form]");
  var success = document.querySelector("[data-form-success]");
  if (form && success) {
    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) return;
      event.preventDefault();
      var data = {
        id: Date.now().toString(36),
        at: new Date().toISOString(),
        name: (form.querySelector('[name="name"]')||{}).value || "",
        email: (form.querySelector('[name="email"]')||{}).value || "",
        role: (form.querySelector('[name="role"]')||{}).value || "",
        interest: (form.querySelector('[name="interest"]')||{}).value || "",
        message: (form.querySelector('[name="message"]')||{}).value || "",
        status: "new"
      };
      try {
        var key = "prinita-inbox";
        var list = JSON.parse(localStorage.getItem(key) || "[]");
        list.unshift(data);
        localStorage.setItem(key, JSON.stringify(list.slice(0,50)));
        localStorage.setItem("prinita-inbox-count", String(list.length));
      } catch(e){}
      form.hidden = true;
      success.hidden = false;
      var heading = success.querySelector("h2");
      if (heading) heading.focus();
      var link = success.querySelector('a[href="console.html"]');
      if (!link) {
        var p = document.createElement("p");
        p.innerHTML = '<a href="console.html">Open owner console →</a>';
        success.appendChild(p);
      }
    });
  }

  function missIg(img) {
    if (img.dataset.igMissed) return;
    img.dataset.igMissed = "1";
    var figure = img.closest("figure");
    var caption = figure && figure.querySelector("figcaption");
    var link = img.closest("a");
    var next = img.dataset.fallback || "";
    img.dataset.fallback = "";
    if (next) {
      img.alt = img.dataset.fallbackAlt || img.alt;
      if (caption && img.dataset.fallbackCaption) caption.textContent = img.dataset.fallbackCaption;
      if (link && img.dataset.fallbackHref) {
        link.href = img.dataset.fallbackHref;
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
      img.src = next;
      return;
    }
    img.remove();
  }

  document.querySelectorAll("img[data-ig]").forEach(function (img) {
    img.referrerPolicy = "no-referrer";
    img.addEventListener("error", function () {
      missIg(img);
    });
    if (img.complete && img.naturalWidth === 0) missIg(img);
  });

  var printButton = document.querySelector("[data-print]");
  if (printButton) {
    printButton.addEventListener("click", function () {
      window.print();
    });
  }
})();
