import { z } from "zod";
import {
  googleAuthSchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  resetPasswordSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from "./auth.schema";
import type {
  IDataResponse,
  IBasicResponse,
  ITokens,
} from "../../common/types";

export interface IAuthRes extends IDataResponse<ITokens> {}

// Sign up
export interface IRegisterRes extends IDataResponse<{
  id: string;
}> {}

export type TRegisterDTO = z.infer<ReturnType<typeof registerSchema>>;

// Login
export type ILoginRes =
  | IBasicResponse<{ twoStepVerificationEnabled: true }>
  | IDataResponse<ITokens, { twoStepVerificationEnabled: false }>;

export type TLoginDTO = z.infer<ReturnType<typeof loginSchema>>;

// Google Auth
export interface IGoogleAuthRes extends IDataResponse<
  ITokens,
  { isNew: boolean }
> {}

export type TGoogleAuthDTO = z.infer<ReturnType<typeof googleAuthSchema>>;

// Logout
export type TLogoutDTO = z.infer<ReturnType<typeof logoutSchema>>;

// OTP
export type TVerifyOTPDTO = z.infer<ReturnType<typeof verifyOTPSchema>>;

export type TSendOTPDTO = z.infer<ReturnType<typeof sendOTPSchema>>;

// Reset Password
export type TResetPasswordDTO = z.infer<ReturnType<typeof resetPasswordSchema>>;

export interface IVerifyPasswordRes extends IBasicResponse<{
  userId: string | undefined;
}> {}
