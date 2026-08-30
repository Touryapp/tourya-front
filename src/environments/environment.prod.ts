export const environment = {
  production: true,
  apiUrl: "https://tourya-dev-api-5j2nd2oflq-ue.a.run.app/api/v1",
  apiUrlBack: "https://tourya-dev-api-5j2nd2oflq-ue.a.run.app/api/v1",
  baseUrl: "",
  // SEC-06 / FE-02: OAuth Client IDs publicos. Ver comentario en environment.ts.
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
