import { z } from "zod";
import { LANG } from "../../common/enums";
import { objectIdSchema, paginationSchema } from "../../common/validation";

export const commentSchema = (_lang: LANG) =>
  z.object({
    body: z.object({
      postId: objectIdSchema("Invalid Post ID"),
      content: z.string().min(1, "Content cannot be empty"),
    }),
  });

const commentParamsSchema = (_lang: LANG) =>
  z.object({
    commentId: objectIdSchema("Invalid Comment ID"),
  });

export const updateCommentSchema = (lang: LANG) =>
  z.object({
    body: z.object({
      content: z.string().min(1, "Content cannot be empty"),
    }),
    params: commentParamsSchema(lang),
  });

export const commentIdSchema = (lang: LANG) =>
  z.object({
    params: commentParamsSchema(lang),
  });

export const getCommentsSchema = (lang: LANG) =>
  z.object({
    params: z.object({
      postId: objectIdSchema("Invalid Post ID"),
    }),
    query: paginationSchema(lang),
  });
