import { model, Schema } from "mongoose";
import type { IComment } from "../types/comment.type";
import type { TModel } from "../../common/types";

const schema = new Schema<IComment, TModel<IComment>>(
  {
    content: {
      type: String,
      required: [true, "Content is required"],
      minLength: [1, "Content must be at least 1 characters long"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
  },
  { timestamps: true, strict: true, strictQuery: false },
);

export const Comment = model("comment", schema);
