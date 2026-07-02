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

  // Endpoint zapisów na betę (np. API Gateway + Lambda). Puste = zapis tylko lokalnie w przeglądarce.
  signupEndpoint: "",

  // Endpoint zgłoszeń recenzentów. Puste = zapis tylko lokalnie w przeglądarce.
  reviewerEndpoint: "",

  // Endpoint zgłoszeń projektów. Puste = zapis tylko lokalnie w przeglądarce.
  projectEndpoint: ""
};
