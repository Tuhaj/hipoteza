/* Hipoteza roadmap, rendered with D3 (self-hosted, no third-party calls). */
(function () {
  "use strict";
  if (typeof d3 === "undefined") return;
  var el = document.getElementById("roadmapChart");
  if (!el) return;

  var data = [
    { period: "III kw. 2026", tag: "Teraz", status: "active", title: "Publiczna beta",
      desc: "Nabór projektów i recenzentów, budowa procesu oceny. Zbieramy listę osób zainteresowanych startem." },
    { period: "IV kw. 2026", tag: "W planie", status: "planned", title: "Recenzje i komitet",
      desc: "Uformowanie komitetu recenzentów, pierwsze oceny projektów i publikacja reguł jako open source." },
    { period: "I poł. 2027", tag: "W planie", status: "planned", title: "Pierwsze zbiórki",
      desc: "Uruchomienie płatności, pilotażowe zbiórki w modelu „wszystko albo nic”, wypłaty w transzach." },
    { period: "II poł. 2027", tag: "W planie", status: "planned", title: "Zaufanie i skala",
      desc: "Weryfikacja badaczy (ORCID, afiliacja), patronat instytucji oraz matching wpłat." },
    { period: "Później", tag: "Wizja", status: "planned", title: "Ekosystem",
      desc: "Partnerstwa instytucjonalne, otwarte dane wyników i publiczne API platformy." }
  ];

  var sel = d3.select(el);
  sel.selectAll("*").remove();

  var items = sel.selectAll(".rm-item")
    .data(data)
    .enter()
    .append("div")
    .attr("class", function (d) { return "rm-item rm-" + d.status; });

  items.append("div").attr("class", "rm-node")
    .html('<span class="rm-dot" aria-hidden="true"></span>');

  var card = items.append("div").attr("class", "rm-card");
  var head = card.append("div").attr("class", "rm-cardhead");
  head.append("span").attr("class", "rm-period").text(function (d) { return d.period; });
  head.append("span").attr("class", "rm-tag").text(function (d) { return d.tag; });
  card.append("h3").attr("class", "rm-title").text(function (d) { return d.title; });
  card.append("p").attr("class", "rm-desc").text(function (d) { return d.desc; });
})();
