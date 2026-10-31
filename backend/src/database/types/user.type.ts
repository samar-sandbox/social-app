import type {
  PROFILE_PRIVACY,
  USER_GENDER,
  AUTH_PROVIDER,
  USER_ROLE,
} from "../../common/enums";
import type { THydratedDocument } from "../../common/types";

export interface IUser {
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  password?: string;
  phone?: string | undefined;
  age?: number;
  role: USER_ROLE;
  gender?: USER_GENDER;
  provider: AUTH_PROVIDER;
  privacy?: PROFILE_PRIVACY;
  emailConfirmed?: boolean;
  twoStepVerificationEnabled?: boolean;
  image?: string | undefined;
  coverImages?: string[];
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  tokensValidAfter?: Date;
}

export interface IUserVirtuals {
  id: string;
  name: string;
}

export type TUserHydratedDoc = THydratedDocument<IUser, IUserVirtuals>;
