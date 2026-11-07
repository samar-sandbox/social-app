import { z } from "zod";
import { LANG } from "../../common/enums";
import { objectIdSchema, paginationSchema } from "../../common/validation";

export const postSchema = (_lang: LANG) =>
  z.object({
    body: z.object({
      title: z.string().min(3, "Title must be at least 3 characters long"),
      content: z.string().min(3, "Content must be at least 3 characters long"),
    }),
  });

const postParamsSchema = (_lang: LANG) =>
  z.object({
    postId: objectIdSchema("Invalid Post ID"),
  });

export const updatePostSchema = (lang: LANG) =>
  z.object({
    body: postSchema(lang).shape.body.partial(),
    params: postParamsSchema(lang),
  });

export const postIdSchema = (lang: LANG) =>
  z.object({
    params: postParamsSchema(lang),
  });

export const getPostsSchema = (lang: LANG) =>
  z.object({
    params: z.object({
      userId: objectIdSchema("Invalid User ID").optional(),
    }),
    query: paginationSchema(lang),
  });
