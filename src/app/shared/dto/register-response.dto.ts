import { RoleDto } from "./role.dto";

export class RegisterResponseDto {
  fullName: string;
  email: string;
  roles: RoleDto[];
  token: string;

  constructor(
    firstName: string,
    email: string,
    roles: RoleDto[],
    password: string
  ) {
    this.fullName = firstName;
    this.email = email;
    this.roles = roles;
    this.token = password;
  }
}
