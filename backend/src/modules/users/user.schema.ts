import { z } from "zod";
import { LANG } from "../../common/enums";
import { objectIdSchema, paginationSchema } from "../../common/validation";

export const uploadImagesSchema = (_lang: LANG) =>
  z.object({
    files: z.object({
      coverImages: z.array(z.string()).optional(),
      image: z.array(z.string()).optional(),
    }),
  });

export const getProfileSchema = (_lang: LANG) =>
  z.object({
    params: z.object({
      userId: objectIdSchema(
        "Invalid param format, expected ObjectId",
      ).optional(),
    }),
  });

export const updatePrivacySchema = (_lang: LANG) =>
  z.object({
    body: z.object({
      isPrivate: z.boolean(),
    }),
  });

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

export const searchSchema = (lang: LANG) =>
  z.object({
    query: z.object({
      q: z.string().nonempty("Search query is required"),
      ...paginationSchema(lang).shape,
    }),
  });

export const suggestionsSchema = (_lang: LANG) =>
  z.object({
    query: z.object({
      limit: z.coerce
        .number("Limit must be a valid number")
        .int("Limit must be a valid integer")
        .default(10),
    }),
  });
