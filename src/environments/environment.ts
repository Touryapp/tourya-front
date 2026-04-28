// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: "http://34-160-22-16.sslip.io/api/v1",
  apiUrlBack: "http://34-160-22-16.sslip.io/api/v1",
  firebaseConfig: {
    apiKey: "AIzaSyCJyNkzo4e80-G0eBCUrIBDt6bbJ8Osp_g",
    authDomain: "tourya-169d6.firebaseapp.com",
    projectId: "tourya-169d6",
    storageBucket: "tourya-169d6.firebasestorage.app",
    messagingSenderId: "318643880116",
    appId: "1:318643880116:web:f969a728674b09bc3a17e1",
    measurementId: "G-9LTR442NCT",
  },
  wompi: {
    publicKey: 'pub_test_bIOZLLlzg8Oel52ljFIp7Sd4FDEOo1da',
    privateKey: 'prv_test_qSmhjc5VxZqkdTkkPPenk5zPPfnOKn4R',
    integrityKey: 'test_integrity_PnLqXgX3tMbgvUqpXOKnZvfikb3oSV8y',
    eventsKey: 'test_events_ChZirhWC9fePbdLnYT0CwavanHsjhVjv',
    baseUrl: 'https://checkout.wompi.co',
    scriptUrl: 'https://checkout.wompi.co/widget.js'
  }
};
