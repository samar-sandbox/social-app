import { z } from "zod";
import type {
  FOLLOW_STATUS,
  PROFILE_PRIVACY,
  USER_GENDER,
} from "../../common/enums";
import type { IDataResponse, IPaginationInfo } from "../../common/types";
import { IUser } from "../../database";
import {
  getProfileSchema,
  updatePrivacySchema,
  followSchema,
  getFollowRequestsSchema,
  followRelationSchema,
  searchSchema,
  suggestionsSchema,
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

export type TGetProfileDTO = z.infer<ReturnType<typeof getProfileSchema>>;

export type TUpdatePrivacyDTO = z.infer<ReturnType<typeof updatePrivacySchema>>;

export type TFollowDTO = z.infer<ReturnType<typeof followSchema>>;

export type TFollowRelationDTO = z.infer<
  ReturnType<typeof followRelationSchema>
>;

export type TGetFollowRequestsDTO = z.infer<
  ReturnType<typeof getFollowRequestsSchema>
>;

export interface IFollowRequest {
  id: string;
  follower: {
    id: string;
    name: string;
    image: string | null;
    privacy: PROFILE_PRIVACY;
  };
}

export interface IGetFollowRequestsRes extends IDataResponse<
  IFollowRequest[],
  IPaginationInfo
> {}

export type TSearchDTO = z.infer<ReturnType<typeof searchSchema>>;

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

export type TSuggestionsDTO = z.infer<ReturnType<typeof suggestionsSchema>>;

export interface ISuggestionsRes extends IDataResponse<ISearchProfile[]> {}
