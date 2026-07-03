# Hipoteza, crowdfunding dla polskiej nauki

Otwarta, statyczna strona projektu **Hipoteza**, transparentnej platformy finansowania
społecznościowego projektów badawczych („Kickstarter dla nauki”). Finansujemy konkretne,
recenzowane badania, nie osoby. Za darmo dla naukowców i w całości open source.

**Live:** https://hipoteza.isy.sh

Operator: **Piotr Zientara Ego Development** (jednoosobowa działalność gospodarcza).

> Projekt jest w publicznej becie. Nie prowadzimy jeszcze zbiórek ani płatności.
> Zbieramy zgłoszenia projektów i recenzentów oraz budujemy proces oceny.

## Koncept

- **Recenzja ekspercka** przed startem zbiórki (wpłacający nie musi się znać, od oceny jest komitet).
- **Model „wszystko albo nic”** z małymi celami: pilotaże, replikacje, sprzęt, popularyzacja.
- **Radykalna jawność**: budżet, kamienie milowe, dane i wyniki w otwartym dostępie.
- **Wypłata w transzach** po realizacji etapów.
- **Bez prowizji od badaczy**: utrzymanie z dobrowolnych napiwków, patronatu instytucji
  oraz mechanizmu 1,5% podatku przez fundację partnerską.
- **Open source**: kod i reguły możliwe do audytu.

## Struktura

```
site/
  index.html                  strona główna (PL)
  zglos-projekt.html          formularz zgłoszenia projektu badawczego
  zostan-recenzentem.html     formularz zgłoszeń recenzentów
  zasady-recenzji.html        proces i kryteria recenzji
  polityka-prywatnosci.html   RODO + informacja o ciasteczkach
  regulamin.html              regulamin serwisu (etap bety)
  sitemap.xml, robots.txt     SEO
  assets/style.css            design system (jasny motyw + tryb ciemny)
  assets/config.js            konfiguracja: Stripe i endpointy zapisów (uzupełnij)
  assets/app.js               demo-projekty, baner cookies, zgody, formularze, nawigacja
  assets/og-image.png         obraz Open Graph
  assets/fonts/               samodzielnie hostowane fonty Source Sans 3
deploy.sh                     sync do dowolnego bucketu S3 + inwalidacja CloudFront
```

Strona jest w pełni statyczna. Nie używamy ciasteczek śledzących ani analityki, tylko
niezbędnej pamięci lokalnej przeglądarki. Fonty są hostowane samodzielnie (bez zewnętrznych CDN).

Formularze domyślnie zapisują dane tylko lokalnie w przeglądarce (`localStorage`). Aby zgłoszenia
realnie trafiały na serwer, ustaw `signupEndpoint`, `reviewerEndpoint` i `projectEndpoint`
w `site/assets/config.js` (np. własny endpoint API).

## Podgląd lokalny

To zwykłe pliki statyczne. Uruchom dowolny lokalny serwer w katalogu `site/`, na przykład:

```bash
cd site && python3 -m http.server 8000
```

Następnie otwórz `http://localhost:8000`.

## Podłączenie płatności (opcjonalnie)

Najprostsza, bezserwerowa droga to **Stripe Payment Link**: utwórz link w panelu Stripe
i wklej go do `site/assets/config.js` jako `stripePaymentLink`. Puste pole = przyciski kierują
do zapisu na betę. Pełne zbiórki z podziałem środków będą wymagały Stripe Connect i lekkiego backendu.

## Deploy

Skrypt jest niezależny od konkretnej infrastruktury i czyta cel z zmiennych środowiskowych:

```bash
HIPOTEZA_BUCKET=twoj-bucket HIPOTEZA_DISTRIBUTION_ID=twoja-dystrybucja ./deploy.sh
```

## Wkład i licencja

Wkład jest mile widziany. Zajrzyj do [CONTRIBUTING.md](CONTRIBUTING.md).
Projekt jest udostępniony na licencji [MIT](LICENSE).
