# Przewodnik po stylu (styleguide)

Konwencje kodu i treści dla projektu Hipoteza. Celem jest spójność, dostępność,
prywatność i zero niespodzianek przy wdrożeniu. Reguły egzekwują `npm run check`
(strażnik) oraz `npm test` (testy strukturalne), a formatowanie kodu narzędziowego
pilnuje Prettier.

## Zasady ogólne

- **Statyczność.** Wdrażany serwis to czyste pliki HTML, CSS i vanilla JS. Bez frameworka,
  bez kroku build, bez zależności runtime. Ma działać po otwarciu pliku.
- **Prywatność.** Zero zewnętrznych trackerów, analityki i CDN. Fonty i biblioteki
  (np. D3) hostujemy samodzielnie w `site/assets/`. Formularze wymagają zgody RODO.
- **Uczciwy przekaz bety.** Nie obiecujemy funkcji, których nie ma. Dane demonstracyjne
  oznaczamy jako symulację. Status komitetu recenzentów: w trakcie formowania.

## Typografia i treść

- **Bez długich myślników.** Nie używamy znaków em dash (U+2014) ani en dash (U+2013)
  w żadnej treści: kopia, dokumenty, komentarze, komunikaty commitów. Zamiast nich:
  przecinek, kropka, dwukropek lub nawias. Strażnik odrzuca commit z takim znakiem.
- **Twarde spacje.** Po jednoliterowych słowach (a, i, o, u, w, z) stosujemy twardą
  spację (U+00A0), żeby nie zostawały na końcu linii.
- **Język.** Treść serwisu jest po polsku, z poprawnymi znakami diakrytycznymi,
  także w etykietach ARIA.

## HTML

- Semantyczne znaczniki (`header`, `main`, `nav`, `section`, `footer`), sensowna
  hierarchia nagłówków, etykiety ARIA i obsługa klawiatury.
- Każda strona w `head`: `lang="pl"`, `charset`, `viewport`, unikalny `title`,
  `meta description`, favicon, tagi Open Graph i `canonical`.
- Nowe podstrony dziedziczą nagłówek, stopkę, przełącznik motywu i ikonę GitHub
  z istniejących stron. Dopisz je do `site/sitemap.xml` i do linków w stopce.
- **Honeypot.** Formularze mają ukryte pole pułapkę (`class="hp"`) chowane stylem
  inline, aby pozostało niewidoczne nawet przy nieaktualnym CSS.
- Strona `404.html` używa ścieżek od korzenia (`/assets/...`), bo błąd może paść
  pod dowolnym adresem.

## CSS

- Jeden arkusz: `site/assets/style.css`. Design system oparty na custom properties
  (tokeny w `:root`), marka teal `#0a8f8c`.
- Motyw jasny domyślnie, tryb ciemny przez `:root[data-theme="dark"]` i `localStorage`.
- Nazewnictwo w duchu BEM: `.blok`, `.blok__element`, `.blok--modyfikator`.
- Konwencja formatowania: zwięzłe, jednoliniowe reguły (jedna reguła w jednej linii).
  Dlatego arkusz jest wyłączony z Prettiera.
- Kolory tylko z tokenów, bez wartości na sztywno w komponentach.

## JavaScript

- Vanilla JS, bez zależności runtime. Logika w `site/assets/app.js`, konfiguracja
  w `site/assets/config.js`.
- Kod owinięty w IIFE, defensywne guardy (sprawdzaj istnienie elementów, `try/catch`
  wokół `localStorage`).
- Bez sekretów w kodzie klienta. Klucze żyją wyłącznie w środowisku Lambdy.

## Dostępność

- Zachowaj kontrast, widoczny focus (`:focus-visible`), etykiety pól i `aria-*`.
- Elementy dekoracyjne oznaczaj `aria-hidden="true"`.

## Bezpieczeństwo i sekrety

- **Bez sekretów w repo.** Klucze i identyfikatory infrastruktury (konto, bucket,
  dystrybucja, strefa DNS) nigdy nie trafiają do plików śledzonych przez git.
- Lokalne wartości trzymamy w `.env.local` (ignorowany), wzorzec w `.env.example`.
- Deploy jest parametryzowany zmiennymi środowiskowymi (patrz `deploy.sh`,
  `backend/deploy-backend.sh`).
- Strażnik `npm run check` skanuje pliki śledzone pod kątem kluczy, kluczy AWS,
  bloków private key oraz wartości z `.env.local`.

## Rozwój i testy

```bash
npm install        # instaluje narzędzia dev i wpina hooki (husky)
npm run serve      # lokalny podgląd na http://localhost:8000 (uruchamiasz sam)
npm run check      # strażnik: myślniki, sekrety, identyfikatory infrastruktury
npm test           # testy strukturalne (meta, sitemap, linki, honeypot)
npm run format     # Prettier dla kodu w scripts/ i test/
npm run verify     # check + test razem
```

Hook `pre-commit` (husky) uruchamia `check`, `format:check` i `test` przed każdym
commitem. CI (GitHub Actions) powtarza to samo na push i pull request.

## Deploy

```bash
HIPOTEZA_BUCKET=<bucket> HIPOTEZA_DISTRIBUTION_ID=<dist> ./deploy.sh
```

Skrypt nie zawiera danych konta. Po deployu zweryfikuj brak długich myślników:
`npm run check`.
