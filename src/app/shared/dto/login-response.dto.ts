import { RoleDto } from "./role.dto";

export class LoginResponseDto {
  fullName: string;
  email: string;
  roleList: RoleDto[];
  token: string;
  accessToken?: string;
  refreshToken?: string;

  constructor(
    firstName: string,
    email: string,
    roleList: RoleDto[],
    password: string,
    accessToken?: string,
    refreshToken?: string
  ) {
    this.fullName = firstName;
    this.email = email;
    this.roleList = roleList;
    this.token = password;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
