export class SocialLoginDto {
    firstname: string;
    lastname: string;
    email: string;
    uuidSocial: string;
  
    constructor(
      firstname: string,
      lastname: string,
      email: string,
      uuidSocial: string
    ) {
      this.firstname = firstname;
      this.lastname = lastname;
      this.email = email;
      this.uuidSocial = uuidSocial;
    }
  }