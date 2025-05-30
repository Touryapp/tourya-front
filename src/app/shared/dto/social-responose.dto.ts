import { LoginResponseDto } from "./login-response.dto";
import { RoleDto } from "./role.dto";

export class SocialResponseDto extends LoginResponseDto {

  constructor(
    firstName: string,
    email: string,
    roles: RoleDto[],
    token: string
  ) {
    super(firstName, email, roles, token);
  }
}