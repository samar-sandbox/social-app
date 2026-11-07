import { model, Schema } from "mongoose";
import type { IPost } from "../types/post.type";
import type { TModel } from "../../common/types";
import { Comment } from "./comment.model";

const schema = new Schema<IPost, TModel<IPost>>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [3, "Title must be at least 3 characters long"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      minLength: [3, "Content must be at least 3 characters long"],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true, strict: true, strictQuery: false },
);

schema.post("deleteOne", async function () {
  const query = this.getQuery();

  const postId = query._id;

  const comments = await Comment.find({ post: postId });

  console.log(
    `POST DELETE: Deleting ${comments.length} comments for post ${postId}...`,
  );

  await Promise.all(
    comments.map((comment) => Comment.deleteOne({ _id: comment.id })),
  );

  console.log(`POST DELETE: Deleted all comments for post ${postId}`);
});

export const Post = model("post", schema);
