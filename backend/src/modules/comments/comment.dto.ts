import {
  commentSchema,
  commentIdSchema,
  updateCommentSchema,
  getCommentsSchema,
} from "./comment.schema";
import type {
  IDataResponse,
  IPaginationInfo,
  TSchema,
} from "../../common/types";
import type { IBasicResponse } from "../../common/types";
import type { IPost, IAuthor } from "../posts/post.dto";

export type ICommentDTO = TSchema<typeof commentSchema>;

export interface ICreateCommentRes extends IDataResponse<{
  id: string;
}> {}

interface IComment {
  id: string;
  content: string;
  author: IAuthor;
}

export interface IPostWithAuthor extends IPost {
  author: IAuthor;
}

export interface ICommentRes extends IDataResponse<
  IComment & { post: IPostWithAuthor }
> {}

export interface ICommentsRes extends IDataResponse<
  IComment[],
  IPaginationInfo & { post: IPostWithAuthor }
> {}

export type IGetCommentsDTO = TSchema<typeof getCommentsSchema>;

export type ICommentIdDTO = TSchema<typeof commentIdSchema>;

export type IUpdateCommentDTO = TSchema<typeof updateCommentSchema>;

export interface IDeleteCommentRes extends IBasicResponse<{
  isAuthor: boolean;
  isPostAuthor: boolean;
}> {}
