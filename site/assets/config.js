/* Hipoteza, konfiguracja front-endu.
   Uzupełnij te wartości, aby podłączyć płatności i zapisy. Nic tu nie jest tajne
   (to plik publiczny), więc wpisuj tylko klucze publiczne, nie sekretne. */
window.HIPOTEZA_CONFIG = {
  // Stripe Payment Link z panelu (Dashboard > Payment links). Przykład:
  // "https://buy.stripe.com/xxxxxxxxxxxxxxxx". Puste = przycisk "Wesprzyj" prowadzi do zapisu na betę.
  stripePaymentLink: "",

  // Publiczny klucz Stripe (pk_live_... lub pk_test_...), pod przyszłą integrację Stripe Checkout.
  // Sam klucz publiczny nie wystarczy do pobierania płatności bez backendu, patrz README.
  stripePublishableKey: "",

  // Backend formularzy (API Gateway + Lambda -> Brevo). Ten sam endpoint dla
  // wszystkich trzech typów, funkcja sama rozpoznaje typ zgłoszenia. To publiczny
  // adres (nie sekret). Zbieranie danych rusza po ustawieniu klucza Brevo na Lambdzie.
  signupEndpoint: "https://bby0t4mk4h.execute-api.eu-central-1.amazonaws.com/",
  reviewerEndpoint: "https://bby0t4mk4h.execute-api.eu-central-1.amazonaws.com/",
  projectEndpoint: "https://bby0t4mk4h.execute-api.eu-central-1.amazonaws.com/",

  // Ankieta kierunku (GET zwraca wyniki, POST {choice:"a"|"b"} oddaje głos).
  // Ten sam backend (Lambda) zapisuje głosy w DynamoDB. Publiczny adres, nie sekret.
  pollEndpoint: "https://bby0t4mk4h.execute-api.eu-central-1.amazonaws.com/poll"
};
