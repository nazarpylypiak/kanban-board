export class UserDto {
  id: string;
  email: string;
  role: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
