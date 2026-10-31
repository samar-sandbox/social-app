import { z } from "zod";
import {
  type LANG,
  LOGOUT_MODE,
  USER_GENDER,
  USER_ROLE,
} from "../../common/enums";
import { invalidEnumValue, validationMessages } from "../../common/validation";

export const registerSchema = (lang: LANG) =>
  z.object({
    body: z.object({
      name: z.string().min(3, validationMessages.name[lang]),
      email: z.email(validationMessages.email[lang]),
      password: z
        .string(validationMessages.password.required[lang])
        .regex(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{6,}$/,
          validationMessages.password.format[lang],
        ),
      phone: z
        .string()
        .regex(/^01[0125][0-9]{8}$/, validationMessages.phone[lang]),
      age: z.coerce
        .number("Age must be a valid number")
        .int()
        .min(18, validationMessages.age.min[lang])
        .max(60, validationMessages.age.max[lang]),
      gender: z.enum(
        USER_GENDER,
        invalidEnumValue("gender", Object.values(USER_GENDER))[lang],
      ),
      role: z
        .enum(
          USER_ROLE,
          invalidEnumValue(
            "role",
            Object.entries(USER_ROLE).map(
              ([key, value]) => `${value} (${key})`,
            ),
          )[lang],
        )
        .default(USER_ROLE.USER),
    }),
  });

export const loginSchema = (lang: LANG) =>
  z.object({
    body: z.object({
      email: z.email(validationMessages.email[lang]),
      password: z.string().min(1, validationMessages.password.required[lang]),
    }),
  });

export const googleAuthSchema = (lang: LANG) =>
  z.object({
    body: z.object({
      credential: z.string().min(1, validationMessages.googleId[lang]),
      clientId: z.string().optional(),
    }),
  });

export const logoutSchema = (lang: LANG) =>
  z.object({
    query: z.object({
      mode: z
        .enum(
          LOGOUT_MODE,
          invalidEnumValue(
            "mode",
            Object.entries(LOGOUT_MODE).map(
              ([key, value]) => `${value} (${key})`,
            ),
          )[lang],
        )
        .default(LOGOUT_MODE.DEVICE),
    }),
  });

const verifyOTPBodySchema = (lang: LANG) =>
  z.object({
    email: z.email(validationMessages.email[lang]),
    otp: z.coerce.string().regex(/[0-9]{6}/, validationMessages.otp[lang]),
  });

export const verifyOTPSchema = (lang: LANG) =>
  z.object({
    body: verifyOTPBodySchema(lang),
  });

export const sendOTPSchema = (lang: LANG) =>
  z.object({
    body: z.object({
      email: z.email(validationMessages.email[lang]),
    }),
  });

export const resetPasswordSchema = (lang: LANG) =>
  z.object({
    body: verifyOTPBodySchema(lang).extend({
      password: z
        .string(validationMessages.password.required[lang])
        .regex(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{6,}$/,
          validationMessages.password.format[lang],
        ),
    }),
  });
