# Wkład w projekt Hipoteza

Cieszymy się, że chcesz pomóc. Ten projekt to statyczna strona (HTML, CSS, JavaScript,
bez frameworka i bez backendu), więc próg wejścia jest niski.

## Jak zacząć

1. Zforkuj repozytorium i sklonuj swój fork.
2. Uruchom podgląd lokalny:
   ```bash
   cd site && python3 -m http.server 8000
   ```
   i otwórz `http://localhost:8000`.
3. Wprowadź zmiany na osobnej gałęzi (`git checkout -b moja-zmiana`).
4. Otwórz Pull Request z krótkim opisem co i dlaczego.

## Rozwój, testy i hooki

Sama strona nie wymaga budowania, ale repozytorium ma lekkie narzędzia dev (Node 18+):

```bash
npm install        # narzędzia dev (husky, prettier) i wpięcie hooków git
npm run check      # strażnik: długie myślniki, sekrety, identyfikatory infrastruktury
npm test           # testy strukturalne (meta, sitemap, linki, honeypot)
npm run verify     # check + test
npm run format     # Prettier dla kodu w scripts/ i test/
```

Hook `pre-commit` (husky) uruchamia strażnika, sprawdzenie formatowania i testy przed
każdym commitem, więc uruchom `npm install` po sklonowaniu, aby go wpiąć. Te same kroki
przechodzi CI na push i pull request. Konwencje opisuje [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md).

## Zasady dotyczące treści i kodu

- **Bez długich myślników.** W tekstach (kopia, dokumenty, komentarze) nie używamy
  em dash ani en dash. Stosujemy przecinki, kropki, dwukropki lub nawiasy.
- **Uczciwy przekaz bety.** Nie obiecujemy funkcji, których nie ma. Na etapie bety
  wyraźnie zaznaczamy, że nie prowadzimy zbiórek ani płatności, a dane demonstracyjne
  są oznaczone jako symulacja.
- **Prywatność przede wszystkim.** Bez zewnętrznych trackerów, analityki i CDN.
  Fonty i zasoby hostujemy samodzielnie. Formularze wymagają zgody RODO.
- **Dostępność.** Zachowuj sensowne etykiety ARIA, kontrast i nawigację klawiaturą.
- **Statyczność.** Nie dodawaj zależności buildowych bez wcześniejszego uzgodnienia.
  Ma działać po otwarciu pliku.
- **Bez danych wrażliwych.** Nie commituj identyfikatorów infrastruktury, kluczy ani
  danych osobowych. Konfiguracja deploya idzie przez zmienne środowiskowe.

## Zgłaszanie błędów i pomysłów

Otwórz Issue z opisem problemu lub propozycji. Dla zmian w treści merytorycznej
(np. proces recenzji) dołącz uzasadnienie lub źródło.

## Licencja wkładu

Zgłaszając Pull Request, zgadzasz się na udostępnienie swojego wkładu na warunkach
licencji [MIT](LICENSE), na której udostępniony jest cały projekt.
