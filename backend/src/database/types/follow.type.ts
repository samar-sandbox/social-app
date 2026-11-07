import type { FOLLOW_STATUS } from "../../common/enums";
import type { THydratedDocument } from "../../common/types";
import type { Types } from "mongoose";

export interface IFollow {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  status: FOLLOW_STATUS;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TFollowHydratedDoc = THydratedDocument<IFollow>;
