import { model, Schema } from "mongoose";
import { FOLLOW_STATUS } from "../../common/enums";
import type { TModel } from "../../common/types";
import type { IFollow, IFollowVirtuals } from "../types/follow.type";

const schema = new Schema<IFollow, TModel<IFollow, IFollowVirtuals>>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: FOLLOW_STATUS,
      default: FOLLOW_STATUS.ACCEPTED,
    },
  },
  { timestamps: true, strict: true },
);

schema.index({ follower: 1, following: 1 }, { unique: true });
schema.index({ following: 1, status: 1 });

export const Follow = model("follow", schema);
