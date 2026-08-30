// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "/api/v1",
  apiUrlBack: "/api/v1",
  // SEC-06 / FE-02: OAuth Client IDs de los proveedores sociales. Son IDs
  // publicos por diseno del protocolo OAuth 2.0 / OIDC — el navegador los
  // expone en cada request al popup del proveedor. Los secrets NUNCA viven
  // en el frontend; los usa el backend en /auth/google y /auth/facebook
  // (ver POST /api/v1/auth/google y /api/v1/auth/facebook, Token Exchange
  // server-side).
  googleClientId: "318643880116-f8a76i410ks8p5b6idqhb9qhf39i405k.apps.googleusercontent.com",
  facebookAppId: "3998716940417210",
  wompi: {
    publicKey: 'pub_test_bIOZLLlzg8Oel52ljFIp7Sd4FDEOo1da',
    privateKey: 'prv_test_qSmhjc5VxZqkdTkkPPenk5zPPfnOKn4R',
    integrityKey: 'test_integrity_PnLqXgX3tMbgvUqpXOKnZvfikb3oSV8y',
    eventsKey: 'test_events_ChZirhWC9fePbdLnYT0CwavanHsjhVjv',
    baseUrl: 'https://checkout.wompi.co',
    scriptUrl: 'https://checkout.wompi.co/widget.js'
  }
};
