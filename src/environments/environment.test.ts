export const environment = {
  production: true,
  apiUrl:'',
  baseUrl:'',
  // SEC-06 / FE-02: Firebase removido. Los tests que instancian environment
  // reciben solo IDs publicos OAuth (vacios aqui — los tests no invocan al
  // popup real, mockean AuthService).
  googleClientId: "",
  facebookAppId: ""
};
