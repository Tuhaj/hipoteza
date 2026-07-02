# Zasady projektu Hipoteza

Wytyczne dla Claude Code i innych kontrybutorów pracujących w tym repozytorium.

## Czym jest projekt

Statyczna strona (HTML, CSS, vanilla JS) platformy crowdfundingu dla nauki „Hipoteza”.
Bez frameworka, bez backendu, bez kroku build. Treść w języku polskim. Serwowana z S3 + CloudFront.
Live: https://hipoteza.isy.sh

## Twarde zasady

- **Bez długich myślników** (— ani –) w żadnej treści: kopia, dokumenty, komentarze, commity.
  Używaj przecinków, kropek, dwukropków lub nawiasów.
- **Nie uruchamiaj serwerów deweloperskich** samodzielnie. Podgląd lokalny odpala użytkownik.
- **Uczciwy przekaz bety.** Nie sugeruj aktywnych zbiórek ani płatności. Dane demonstracyjne
  oznaczaj jako symulację. Status komitetu recenzentów: „w trakcie formowania”.
- **Prywatność.** Zero zewnętrznych trackerów, analityki i CDN. Fonty hostowane samodzielnie.
  Formularze tylko z localStorage lub własnym endpointem, zawsze ze zgodą RODO.
- **Bez danych wrażliwych w repo.** Żadnych identyfikatorów infrastruktury (ID kont, bucketów,
  dystrybucji, stref DNS), kluczy ani sekretów. Deploy parametryzowany zmiennymi środowiskowymi.

## Konwencje

- Motyw jasny domyślnie, tryb ciemny przez `:root[data-theme="dark"]` i `localStorage` (`hipoteza_theme`).
- Design system i tokeny kolorów w `site/assets/style.css` (marka teal `#0a8f8c`).
- Logika interakcji w `site/assets/app.js`; konfiguracja w `site/assets/config.js`.
- Nowe podstrony: dziedziczą nagłówek, stopkę, baner cookies i przełącznik motywu z istniejących stron.
- Każdą stronę dopisuj do `site/sitemap.xml` i do linków w stopce.

## Deploy

```bash
HIPOTEZA_BUCKET=<bucket> HIPOTEZA_DISTRIBUTION_ID=<dist> ./deploy.sh
```

Skrypt nie zawiera żadnych danych konta. Po deployu weryfikuj brak długich myślników:
`grep -rn $'—\|–' site/`.
