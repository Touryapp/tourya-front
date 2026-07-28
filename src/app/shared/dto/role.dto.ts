export class RoleDto {
  createdDate: string;
  id: number;
  lastModifiedDate: string;
  name: string;

  constructor(
    createdDate: string,
    id: number,
    lastModifiedDate: string,
    name: string
  ) {
    this.createdDate = createdDate;
    this.id = id;
    this.lastModifiedDate = lastModifiedDate;
    this.name = name;
  }
}
