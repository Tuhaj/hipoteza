/* Hipoteza, front-end interactions (no third-party tracking). */
(function () {
  "use strict";

  var CFG = window.HIPOTEZA_CONFIG || {};

  // Current year in footer
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Theme toggle (light default, dark optional) ---------- */
  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var root = document.documentElement;
      var isDark = root.getAttribute("data-theme") === "dark";
      if (isDark) {
        root.removeAttribute("data-theme");
        try { localStorage.setItem("hipoteza_theme", "light"); } catch (_) {}
      } else {
        root.setAttribute("data-theme", "dark");
        try { localStorage.setItem("hipoteza_theme", "dark"); } catch (_) {}
      }
    });
  }

  /* ---------- Demo project data ---------- */
  var PROJECTS = {
    bees: {
      tag: "Biologia",
      title: "Marker genetyczny odporności pszczół na warrozę",
      progress: 72,
      meta: "<strong>28 800 zł</strong> z 40 000 zł · 214 wspierających · zostało 11 dni",
      hypothesis: "Rodziny pszczele, które przeżywają inwazję roztoczy Varroa bez leczenia, częściej mają określony wariant genu powiązanego z zachowaniami higienicznymi.",
      method: [
        "Pobranie próbek od 60 rodzin z pasiek prowadzonych bez leczenia",
        "Sekwencjonowanie wybranych regionów genomu",
        "Analiza asocjacji wariantów genu z odpornością",
        "Publikacja danych i protokołu w otwartym dostępie"
      ],
      budget: [
        ["Odczynniki i sekwencjonowanie", "22 000 zł"],
        ["Pobór i transport próbek", "6 000 zł"],
        ["Analiza bioinformatyczna", "9 000 zł"],
        ["Otwarta publikacja danych", "3 000 zł"]
      ],
      total: "40 000 zł",
      milestones: [
        ["Pobranie próbek", "done"],
        ["Sekwencjonowanie", "active"],
        ["Analiza i raport", "todo"]
      ],
      team: "Zespół z wydziału biologii (projekt demonstracyjny)"
    },
    air: {
      tag: "Środowisko",
      title: "Otwarta sieć czujników jakości powietrza w małych miastach",
      progress: 46,
      meta: "<strong>13 700 zł</strong> z 30 000 zł · 132 wspierających · zostało 19 dni",
      hypothesis: "Gęsta sieć tanich czujników wykryje lokalne źródła smogu, których nie widać w rzadkiej sieci oficjalnych stacji pomiarowych.",
      method: [
        "Budowa i kalibracja 50 czujników PM2.5",
        "Montaż u wolontariuszy w pięciu miastach",
        "Publiczne API i mapa danych na żywo",
        "Porównanie odczytów z oficjalnymi stacjami"
      ],
      budget: [
        ["Komponenty czujników", "15 000 zł"],
        ["Kalibracja i obudowy", "5 000 zł"],
        ["Serwer i publiczne API", "4 000 zł"],
        ["Koordynacja wolontariuszy", "6 000 zł"]
      ],
      total: "30 000 zł",
      milestones: [
        ["Prototyp i kalibracja", "done"],
        ["Montaż w terenie", "active"],
        ["Publiczne API", "todo"]
      ],
      team: "Kolektyw open hardware (projekt demonstracyjny)"
    },
    memory: {
      tag: "Psychologia",
      title: "Preregistrowana replikacja badania nad pamięcią roboczą",
      progress: 100,
      done: true,
      meta: "<strong>Sfinansowano</strong> · zebrano 18 000 zł · 389 wspierających",
      hypothesis: "Efekt opisany w klasycznym badaniu utrzyma się w większej, zarejestrowanej z góry próbie dorosłych.",
      method: [
        "Preregistracja hipotez i planu analiz",
        "Rekrutacja 300 uczestników",
        "Powtórzenie procedury oryginalnego eksperymentu",
        "Publikacja wyniku niezależnie od jego kierunku"
      ],
      budget: [
        ["Wynagrodzenia uczestników", "9 000 zł"],
        ["Platforma badawcza", "3 000 zł"],
        ["Analiza i preregistracja", "3 000 zł"],
        ["Otwarta publikacja", "3 000 zł"]
      ],
      total: "18 000 zł",
      milestones: [
        ["Preregistracja", "done"],
        ["Zbieranie danych", "done"],
        ["Publikacja wyniku", "done"]
      ],
      team: "Laboratorium psychologii poznawczej (projekt demonstracyjny)"
    }
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function renderProject(p) {
    var method = p.method.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("");
    var budget = p.budget.map(function (b) {
      return "<li><span>" + esc(b[0]) + "</span><strong>" + esc(b[1]) + "</strong></li>";
    }).join("");
    budget += '<li class="pm-budget__total"><span>Cel łącznie</span><strong>' + esc(p.total) + "</strong></li>";
    var miles = p.milestones.map(function (m) {
      var state = m[1];
      var ico = state === "done" ? "✓" : state === "active" ? "•" : "";
      var cls = state === "done" ? "is-done" : state === "active" ? "is-active" : "";
      return '<li class="' + cls + '"><span class="m-ico">' + ico + "</span>" + esc(m[0]) + "</li>";
    }).join("");
    var metaCls = p.done ? "pm-meta pm-meta--done" : "pm-meta";

    return "" +
      '<div class="pm-top"><span class="pm-demo">DEMO</span><span class="pm-tag">' + esc(p.tag) + "</span></div>" +
      '<h3 class="pm-title" id="pmTitle">' + esc(p.title) + "</h3>" +
      '<div class="progress" aria-hidden="true"><span style="width:' + p.progress + '%"></span></div>' +
      '<p class="' + metaCls + '">' + p.meta + "</p>" +
      '<div class="pm-section"><h4>Hipoteza</h4><p>' + esc(p.hypothesis) + "</p></div>" +
      '<div class="pm-section"><h4>Plan badania</h4><ul class="pm-list">' + method + "</ul></div>" +
      '<div class="pm-section"><h4>Budżet</h4><ul class="pm-budget">' + budget + "</ul></div>" +
      '<div class="pm-section"><h4>Kamienie milowe</h4><ul class="pm-miles">' + miles + "</ul></div>" +
      '<div class="pm-section"><h4>Zespół</h4><p>' + esc(p.team) + "</p></div>" +
      '<div class="pm-foot">' +
        '<button class="btn" type="button" id="pmSupport">Wesprzyj (demo)</button>' +
        '<a class="btn btn--ghost" href="#zapisz" data-close>Dołącz do bety</a>' +
        '<p class="pm-note" id="pmNote">To projekt demonstracyjny. Prawdziwe, recenzowane zbiórki ruszą w wersji beta.</p>' +
      "</div>";
  }

  /* ---------- Modal control ---------- */
  var modal = document.getElementById("projectModal");
  var modalBody = document.getElementById("modalBody");
  var lastFocused = null;

  function openModal(id) {
    var p = PROJECTS[id];
    if (!p || !modal || !modalBody) return;
    modalBody.innerHTML = renderProject(p);
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    lastFocused = document.activeElement;
    var closeBtn = modal.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus();

    var support = document.getElementById("pmSupport");
    if (support) {
      support.addEventListener("click", function () {
        if (CFG.stripePaymentLink) {
          window.open(CFG.stripePaymentLink, "_blank", "noopener");
          return;
        }
        var note = document.getElementById("pmNote");
        if (note) {
          note.textContent = "To demonstracja. Zostaw kontakt w sekcji „Dołącz do bety”, a damy znać, gdy ruszą prawdziwe zbiórki.";
          note.classList.add("show");
        }
      });
    }
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.querySelectorAll(".pcard[data-project]").forEach(function (card) {
    card.addEventListener("click", function () { openModal(card.getAttribute("data-project")); });
  });

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------- Cookie / local-storage notice ---------- */
  var banner = document.getElementById("cookieBanner");
  var cookieOk = document.getElementById("cookieOk");
  var COOKIE_KEY = "hipoteza_notice_ok";
  var noticeAccepted = false;
  try { noticeAccepted = localStorage.getItem(COOKIE_KEY) === "1"; } catch (_) {}
  if (banner && !noticeAccepted) banner.hidden = false;
  if (cookieOk) {
    cookieOk.addEventListener("click", function () {
      try { localStorage.setItem(COOKIE_KEY, "1"); } catch (_) {}
      if (banner) banner.hidden = true;
    });
  }

  /* ---------- Stripe support buttons ---------- */
  var supportBtns = document.querySelectorAll("[data-stripe]");
  Array.prototype.forEach.call(supportBtns, function (btn) {
    if (CFG.stripePaymentLink) {
      btn.setAttribute("href", CFG.stripePaymentLink);
      btn.setAttribute("rel", "noopener");
      btn.setAttribute("target", "_blank");
    }
  });

  /* ---------- Signup form ---------- */
  var form = document.getElementById("signupForm");
  var note = document.getElementById("formNote");
  var emailEl = document.getElementById("email");
  var consentBox = document.getElementById("consentBox");
  var consentShown = false;

  function revealConsent() {
    if (consentShown || !consentBox) return;
    consentShown = true;
    consentBox.hidden = false;
    // next frame so the transition runs from the collapsed state
    requestAnimationFrame(function () { consentBox.classList.add("is-visible"); });
  }

  if (emailEl) {
    emailEl.addEventListener("focus", revealConsent);
    emailEl.addEventListener("input", function () {
      if (emailEl.value.trim().length > 0) revealConsent();
    });
  }

  function setNote(msg, cls) {
    if (!note) return;
    note.textContent = msg;
    note.className = "signup__note" + (cls ? " " + cls : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var rola = document.getElementById("rola");
      var consent = document.getElementById("consent");
      var value = (emailEl && emailEl.value ? emailEl.value : "").trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!validEmail) {
        setNote("Podaj poprawny adres e-mail.", "err");
        if (emailEl) emailEl.focus();
        return;
      }
      revealConsent();
      if (consent && !consent.checked) {
        setNote("Zaznacz zgodę na przetwarzanie danych, aby się zapisać.", "err");
        consent.focus();
        return;
      }

      var payload = {
        hp: (document.getElementById("s_hp") || {}).value || "",
        email: value,
        rola: rola ? rola.value : "",
        consent: true,
        ts: new Date().toISOString(),
        source: "hipoteza"
      };

      try {
        var list = JSON.parse(localStorage.getItem("hipoteza_signups") || "[]");
        list.push(payload);
        localStorage.setItem("hipoteza_signups", JSON.stringify(list));
      } catch (_) {}

      if (CFG.signupEndpoint) {
        setNote("Zapisujemy...", "");
        fetch(CFG.signupEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            form.reset();
            if (consentBox) { consentBox.classList.remove("is-visible"); consentBox.hidden = true; consentShown = false; }
            setNote("Dzięki! Zapisaliśmy Cię na listę. Odezwiemy się przy starcie bety.", "ok");
          })
          .catch(function () {
            setNote("Zapisaliśmy Cię lokalnie. Spróbujemy dosłać zgłoszenie później.", "ok");
          });
      } else {
        form.reset();
        if (consentBox) { consentBox.classList.remove("is-visible"); consentBox.hidden = true; consentShown = false; }
        setNote("Dzięki! Zapisaliśmy Cię na listę. Odezwiemy się przy starcie bety.", "ok");
      }
    });
  }

  /* ---------- Reviewer application form ---------- */
  var rform = document.getElementById("reviewerForm");
  var rnote = document.getElementById("reviewerNote");

  function setRNote(msg, cls) {
    if (!rnote) return;
    rnote.textContent = msg;
    rnote.className = "rform__note" + (cls ? " " + cls : "");
  }

  if (rform) {
    rform.addEventListener("submit", function (e) {
      e.preventDefault();
      function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
      function mark(id, bad) { var el = document.getElementById(id); if (el) el.classList.toggle("invalid", !!bad); }

      var name = val("r_name");
      var email = val("r_email");
      var field = val("r_field");
      var expertise = val("r_expertise");
      var consent = document.getElementById("r_consent");
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      var checks = [["r_name", !name], ["r_email", !okEmail], ["r_field", !field], ["r_expertise", !expertise]];
      var firstBad = null;
      checks.forEach(function (c) { mark(c[0], c[1]); if (c[1] && !firstBad) firstBad = c[0]; });

      if (firstBad) {
        setRNote("Uzupełnij wymagane pola oznaczone gwiazdką.", "err");
        var badEl = document.getElementById(firstBad);
        if (badEl) badEl.focus();
        return;
      }
      if (consent && !consent.checked) {
        setRNote("Zaznacz zgodę na przetwarzanie danych, aby wysłać zgłoszenie.", "err");
        consent.focus();
        return;
      }

      var pub = document.getElementById("r_public");
      var payload = {
        type: "reviewer",
        hp: val("r_hp"),
        name: name,
        email: email,
        affiliation: val("r_aff"),
        degree: val("r_degree"),
        field: field,
        expertise: expertise,
        orcid: val("r_orcid"),
        profile: val("r_profile"),
        experience: val("r_exp"),
        capacity: val("r_capacity"),
        bio: val("r_bio"),
        publicListing: pub ? pub.checked : false,
        consent: true,
        ts: new Date().toISOString(),
        source: "hipoteza"
      };

      try {
        var list = JSON.parse(localStorage.getItem("hipoteza_reviewers") || "[]");
        list.push(payload);
        localStorage.setItem("hipoteza_reviewers", JSON.stringify(list));
      } catch (_) {}

      if (CFG.reviewerEndpoint) {
        setRNote("Wysyłamy...", "");
        fetch(CFG.reviewerEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            rform.reset();
            setRNote("Dziękujemy! Zgłoszenie przyjęte. Odezwiemy się po przejrzeniu zgłoszeń.", "ok");
          })
          .catch(function () {
            setRNote("Zapisaliśmy zgłoszenie lokalnie. Spróbujemy dosłać je później.", "ok");
          });
      } else {
        rform.reset();
        setRNote("Dziękujemy! Zgłoszenie przyjęte. Odezwiemy się po przejrzeniu zgłoszeń.", "ok");
      }
    });
  }

  /* ---------- Project submission form ---------- */
  var pform = document.getElementById("projectForm");
  var pnote = document.getElementById("projectNote");

  function setPNote(msg, cls) {
    if (!pnote) return;
    pnote.textContent = msg;
    pnote.className = "rform__note" + (cls ? " " + cls : "");
  }

  if (pform) {
    pform.addEventListener("submit", function (e) {
      e.preventDefault();
      function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; }
      function mark(id, bad) { var el = document.getElementById(id); if (el) el.classList.toggle("invalid", !!bad); }

      var lead = val("p_lead");
      var email = val("p_email");
      var title = val("p_title");
      var field = val("p_field");
      var hypothesis = val("p_hypothesis");
      var method = val("p_method");
      var budget = val("p_budget");
      var consent = document.getElementById("p_consent");
      var okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      var checks = [
        ["p_lead", !lead], ["p_email", !okEmail], ["p_title", !title],
        ["p_field", !field], ["p_hypothesis", !hypothesis], ["p_method", !method], ["p_budget", !budget]
      ];
      var firstBad = null;
      checks.forEach(function (c) { mark(c[0], c[1]); if (c[1] && !firstBad) firstBad = c[0]; });

      if (firstBad) {
        setPNote("Uzupełnij wymagane pola oznaczone gwiazdką.", "err");
        var badEl = document.getElementById(firstBad);
        if (badEl) badEl.focus();
        return;
      }
      if (consent && !consent.checked) {
        setPNote("Zaznacz zgodę na przetwarzanie danych, aby wysłać zgłoszenie.", "err");
        consent.focus();
        return;
      }

      var payload = {
        type: "project",
        hp: val("p_hp"),
        lead: lead,
        email: email,
        affiliation: val("p_aff"),
        orcid: val("p_orcid"),
        title: title,
        field: field,
        hypothesis: hypothesis,
        method: method,
        budget: budget,
        milestones: val("p_milestones"),
        risks: val("p_risks"),
        openData: val("p_data"),
        consent: true,
        ts: new Date().toISOString(),
        source: "hipoteza"
      };

      try {
        var list = JSON.parse(localStorage.getItem("hipoteza_projects") || "[]");
        list.push(payload);
        localStorage.setItem("hipoteza_projects", JSON.stringify(list));
      } catch (_) {}

      if (CFG.projectEndpoint) {
        setPNote("Wysyłamy...", "");
        fetch(CFG.projectEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            pform.reset();
            setPNote("Dziękujemy! Zgłoszenie projektu przyjęte. Odezwiemy się po jego przejrzeniu.", "ok");
          })
          .catch(function () {
            setPNote("Zapisaliśmy zgłoszenie lokalnie. Spróbujemy dosłać je później.", "ok");
          });
      } else {
        pform.reset();
        setPNote("Dziękujemy! Zgłoszenie projektu przyjęte. Odezwiemy się po jego przejrzeniu.", "ok");
      }
    });
  }

  /* ---------- Active nav link on scroll ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (a && en.isIntersecting) {
          links.forEach(function (l) { l.style.color = ""; });
          a.style.color = "var(--text)";
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------- Poll (wybór kierunku, backend zlicza głosy) ---------- */
  (function () {
    var root = document.getElementById("poll");
    if (!root) return;
    var endpoint = CFG.pollEndpoint;
    var note = document.getElementById("pollNote");
    var opts = Array.prototype.slice.call(root.querySelectorAll(".poll__opt"));
    var STORE = "hipoteza_poll_vote";

    function plural(n) {
      var n10 = n % 10, n100 = n % 100;
      if (n === 1) return "głos";
      if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return "głosy";
      return "głosów";
    }
    function pct(n, total) { return total > 0 ? Math.round((n / total) * 100) : 0; }
    function stored() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
    function remember(c) { try { localStorage.setItem(STORE, c); } catch (e) {} }

    function render(res, myChoice) {
      var counts = { a: (res && res.a) || 0, b: (res && res.b) || 0 };
      var total = counts.a + counts.b;
      opts.forEach(function (btn) {
        var c = btn.getAttribute("data-choice");
        var p = pct(counts[c], total);
        var fill = btn.querySelector(".poll__fill");
        var pctEl = btn.querySelector(".poll__pct");
        if (fill) fill.style.width = p + "%";
        if (pctEl) pctEl.textContent = p + "%";
        btn.setAttribute("aria-pressed", c === myChoice ? "true" : "false");
      });
      if (myChoice) {
        root.setAttribute("data-state", "voted");
        note.textContent = "Dziękujemy za głos. Oddano " + total + " " + plural(total) + ". Wyniki na żywo.";
      } else {
        root.setAttribute("data-state", "ready");
        note.textContent = total > 0
          ? "Oddano " + total + " " + plural(total) + ". Zagłosuj, aby zobaczyć podział."
          : "Bądź pierwszą osobą, która zagłosuje.";
      }
    }

    function vote(choice) {
      if (!endpoint) return;
      root.setAttribute("data-state", "loading");
      note.textContent = "Zapisujemy głos...";
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice: choice })
      })
        .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
        .then(function (res) { remember(choice); render(res, choice); })
        .catch(function () {
          root.setAttribute("data-state", "ready");
          note.textContent = "Nie udało się zapisać głosu. Spróbuj ponownie za chwilę.";
        });
    }

    opts.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (root.getAttribute("data-state") === "voted" || stored()) return;
        vote(btn.getAttribute("data-choice"));
      });
    });

    var mine = stored();
    if (!endpoint) {
      root.setAttribute("data-state", "ready");
      note.textContent = "Ankieta będzie dostępna wkrótce.";
      return;
    }
    fetch(endpoint, { method: "GET" })
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (res) { render(res, mine); })
      .catch(function () {
        if (mine) {
          root.setAttribute("data-state", "voted");
          note.textContent = "Dziękujemy za głos.";
        } else {
          root.setAttribute("data-state", "ready");
          note.textContent = "Nie udało się pobrać wyników. Możesz zagłosować mimo to.";
        }
      });
  })();
})();
