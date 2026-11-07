import type {
  FOLLOW_STATUS,
  PROFILE_PRIVACY,
  USER_GENDER,
} from "../../common/enums";
import type {
  IDataResponse,
  IPaginationInfo,
  TSchema,
} from "../../common/types";
import { IUser } from "../../database";
import {
  getProfileSchema,
  updatePrivacySchema,
  searchSchema,
  suggestionsSchema,
  deleteUserSchema,
} from "./user.schema";

export interface IUsersRes extends IDataResponse<IUser[]> {}

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  privacy: PROFILE_PRIVACY;
  coverImages?: string[];
  age?: number | undefined;
  gender?: USER_GENDER | undefined;
  followers: number;
  following: number;
  relationship: FOLLOW_STATUS | "self" | null;
  createdAt: Date | undefined;
}

export interface IUserRes extends IDataResponse<IUserProfile> {}

export interface IUploadImagesRes extends IDataResponse<
  Record<string, string[]>
> {}

export type TGetProfileDTO = TSchema<typeof getProfileSchema>;

export type TUpdatePrivacyDTO = TSchema<typeof updatePrivacySchema>;

export type TSearchDTO = TSchema<typeof searchSchema>;

export interface ISearchProfile {
  id: string;
  name: string;
  image: string | null;
  privacy: PROFILE_PRIVACY;
}

export interface ISearchRes extends IDataResponse<
  ISearchProfile[],
  IPaginationInfo
> {}

export type TSuggestionsDTO = TSchema<typeof suggestionsSchema>;

export interface ISuggestionsRes extends IDataResponse<ISearchProfile[]> {}

export type TDeleteUserDTO = TSchema<typeof deleteUserSchema>;
