export type UserType = {
  _id?: string;
  username: string;
  password: string;
  role: Role;
  __v?: number;
};

export interface DB {
  user: UserType[];
}

enum Role {
  ADMIN = "admin",
  USER = "user",
}
