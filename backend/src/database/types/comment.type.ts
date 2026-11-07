import { Types } from "mongoose";
import type { THydratedDocument } from "../../common/types";

export interface IComment {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TCommentHydratedDoc = THydratedDocument<IComment>;
