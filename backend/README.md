# Hipoteza forms backend (AWS Lambda + Brevo)

Minimalny, bezserwerowy backend do zbierania zgłoszeń z formularzy (zapis na betę,
recenzent, projekt). Odbiera JSON, dopisuje kontakt do Brevo i opcjonalnie wysyła
e-mail z powiadomieniem. Klucz API Brevo trzymany jest wyłącznie jako zmienna
środowiskowa Lambdy, nigdy w publicznej stronie.

## Architektura

```
przeglądarka (formularz)  ->  API Gateway HTTP API  ->  Lambda  ->  Brevo API
                                                          |  klucz API tylko tutaj (env var)
```

- `lambda/index.mjs` - funkcja (Node.js 20, bez zależności, wbudowany `fetch`).
  CORS i preflight OPTIONS obsługiwane wewnątrz funkcji.
- `deploy-backend.sh` - tworzy rolę IAM (least privilege), funkcję oraz publiczny
  endpoint API Gateway (HTTP API). Parametryzowany zmiennymi środowiskowymi, bez danych konta.

Uwaga: pierwotnie użyliśmy Lambda Function URL, ale to konto AWS blokuje anonimowe
Function URL na poziomie polityki organizacji (SCP/RCP), więc frontem jest API Gateway,
który jest standardowo dozwolony.

## Wdrożenie

```bash
cd backend
HIPOTEZA_ALLOW_ORIGIN=https://hipoteza.isy.sh ./deploy-backend.sh
```

Skrypt wypisze `Function URL`. Wpisz go do `site/assets/config.js` jako
`signupEndpoint`, `reviewerEndpoint`, `projectEndpoint` (ten sam URL, funkcja sama
rozpoznaje typ zgłoszenia).

## Ustawienie klucza Brevo (robisz Ty, sekret)

Klucz API pobierz w Brevo: SMTP & API -> API Keys. Następnie ustaw go na funkcji
(nie commituj go nigdzie):

```bash
aws lambda update-function-configuration \
  --function-name hipoteza-forms --region eu-central-1 \
  --environment 'Variables={ALLOW_ORIGIN=https://hipoteza.isy.sh,NOTIFY_EMAIL=pz@xfaang.com,SENDER_EMAIL=pz@xfaang.com,SIGNUP_LIST_ID=<ID_LISTY>,BREVO_API_KEY=<TWOJ_KLUCZ>}'
```

- `SIGNUP_LIST_ID` - ID listy w Brevo (Contacts -> Lists), do której dopisujemy kontakty.
- `SENDER_EMAIL` - adres nadawcy powiadomień; musi być zweryfikowany w Brevo
  (Senders). Zgodnie z ustaleniami: `pz@xfaang.com`.

Uwaga: podmieniając zmienne przez `update-function-configuration` podajesz PEŁNY
zestaw (polecenie nadpisuje całość). Zachowaj pozostałe klucze jak wyżej.

## Zmienne środowiskowe

| Zmienna | Rola |
| --- | --- |
| `BREVO_API_KEY` | Sekretny klucz API Brevo. Bez niego funkcja zwraca 503. |
| `SIGNUP_LIST_ID` | Lista Brevo dla kontaktów (opcjonalne). |
| `NOTIFY_EMAIL` | Adres, na który idzie e-mail o nowym zgłoszeniu. |
| `SENDER_EMAIL` | Zweryfikowany nadawca Brevo (domyślnie = NOTIFY_EMAIL). |
| `ALLOW_ORIGIN` | Dozwolony origin CORS (np. https://hipoteza.isy.sh). |

## Uwagi

- Endpoint jest publiczny (formularz jest publiczny). Walidujemy e-mail i zgodę,
  Brevo deduplikuje kontakty. Przy większym ruchu warto dodać ochronę anty-spam
  (np. honeypot, prosty rate limit).
- Zanim ustawisz klucz, formularze działają, a strona pokazuje komunikat o zapisie
  lokalnym (dane nie giną po stronie użytkownika). Po ustawieniu klucza zgłoszenia
  trafiają do Brevo i na e-mail.
