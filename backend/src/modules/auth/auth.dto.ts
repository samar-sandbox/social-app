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
  TSchema,
} from "../../common/types";

export interface IAuthRes extends IDataResponse<ITokens> {}

// Sign up
export interface IRegisterRes extends IDataResponse<{
  id: string;
}> {}

export type TRegisterDTO = TSchema<typeof registerSchema>;

// Login
export type ILoginRes =
  | IBasicResponse<{ twoStepVerificationEnabled: true }>
  | IDataResponse<ITokens, { twoStepVerificationEnabled: false }>;

export type TLoginDTO = TSchema<typeof loginSchema>;

// Google Auth
export interface IGoogleAuthRes extends IDataResponse<
  ITokens,
  { isNew: boolean }
> {}

export type TGoogleAuthDTO = TSchema<typeof googleAuthSchema>;

// Logout
export type TLogoutDTO = TSchema<typeof logoutSchema>;

// OTP
export type TVerifyOTPDTO = TSchema<typeof verifyOTPSchema>;

export type TSendOTPDTO = TSchema<typeof sendOTPSchema>;

// Reset Password
export type TResetPasswordDTO = TSchema<typeof resetPasswordSchema>;

export interface IVerifyPasswordRes extends IBasicResponse<{
  userId: string | undefined;
}> {}
