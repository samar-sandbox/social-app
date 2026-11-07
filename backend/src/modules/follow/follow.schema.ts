import { z } from "zod";
import { LANG } from "../../common/enums";
import { objectIdSchema, paginationSchema } from "../../common/validation";

export const followSchema = (_lang: LANG) =>
  z.object({
    params: z.object({
      userId: objectIdSchema("Invalid param format, expected ObjectId"),
    }),
  });

export const followRelationSchema = (_lang: LANG) =>
  z.object({
    params: z.object({
      relationId: objectIdSchema("Invalid param format, expected ObjectId"),
    }),
  });

export const getFollowRequestsSchema = (lang: LANG) =>
  z.object({
    query: paginationSchema(lang),
  });
