import { Types } from "mongoose";
import type { THydratedDocument } from "../../common/types";

export interface IPost {
  title: string;
  content: string;
  author: Types.ObjectId;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TPostHydratedDoc = THydratedDocument<IPost>;
