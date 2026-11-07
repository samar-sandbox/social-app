import type { PROFILE_PRIVACY } from "../../common/enums";
import type {
  IDataResponse,
  IPaginationInfo,
  TSchema,
} from "../../common/types";
import {
  followSchema,
  getFollowRequestsSchema,
  followRelationSchema,
} from "./follow.schema";

export type TFollowDTO = TSchema<typeof followSchema>;

export type TFollowRelationDTO = TSchema<typeof followRelationSchema>;

export type TGetFollowRequestsDTO = TSchema<typeof getFollowRequestsSchema>;

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
