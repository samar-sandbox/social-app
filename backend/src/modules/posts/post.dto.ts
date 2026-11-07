import {
  postSchema,
  postIdSchema,
  updatePostSchema,
  getPostsSchema,
} from "./post.schema";
import type {
  IDataResponse,
  IPaginationInfo,
  TSchema,
} from "../../common/types";
import { PROFILE_PRIVACY } from "../../common/enums";

export type IPostDTO = TSchema<typeof postSchema>;

export interface ICreatePostRes extends IDataResponse<{
  id: string;
}> {}

export interface IAuthor {
  id: string;
  name: string;
  privacy: PROFILE_PRIVACY;
}

export interface IPost {
  id: string;
  title: string;
  content: string;
}

export interface IPostRes extends IDataResponse<IPost & { author: IAuthor }> {}

export interface IPostsRes extends IDataResponse<
  IPost[],
  IPaginationInfo & { author?: IAuthor | undefined }
> {}

export type IGetPostsDTO = TSchema<typeof getPostsSchema>;

export type IPostIdDTO = TSchema<typeof postIdSchema>;

export type IUpdatePostDTO = TSchema<typeof updatePostSchema>;
