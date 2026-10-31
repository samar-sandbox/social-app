import type { USER_ROLE } from "../enums";

declare module "jsonwebtoken" {
  interface JwtPayload {
    id: string;
    role: USER_ROLE;
  }
}

export interface IPayload {
  sub: string;
  role: USER_ROLE;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
