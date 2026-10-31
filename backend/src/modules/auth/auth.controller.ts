import { Router } from "express";
import { authService } from "./auth.service";
import {
  authentication,
  sendResponse,
  validation,
} from "../../common/middlewares";
import {
  verifyOTPSchema,
  googleAuthSchema,
  loginSchema,
  logoutSchema,
  registerSchema,
  sendOTPSchema,
  resetPasswordSchema,
} from "./auth.schema";
import { getAuthUser, getReqData } from "../../common/helpers";
import type {
  IAuthRes,
  IGoogleAuthRes,
  ILoginRes,
  IRegisterRes,
  IVerifyPasswordRes,
  TGoogleAuthDTO,
  TLoginDTO,
  TLogoutDTO,
  TRegisterDTO,
  TResetPasswordDTO,
  TSendOTPDTO,
  TVerifyOTPDTO,
} from "./auth.dto";
import type { IBasicResponse } from "../../common/types";

const router = Router();

// Google Auth
router.post(
  "/google",
  validation(googleAuthSchema),
  sendResponse<Omit<IGoogleAuthRes, "isNew">>(async (req) => {
    const { body } = getReqData<TGoogleAuthDTO>(req);

    const { isNew, ...result } = await authService.handleGoogleAuth(body);

    return {
      status: isNew ? 201 : 200,
      ...result,
    };
  }),
);

// Signup
router.post(
  "/signup",
  validation(registerSchema),
  sendResponse<IRegisterRes>(async (req) => {
    const { body } = getReqData<TRegisterDTO>(req);

    const result = await authService.signup(body);

    return { status: 201, ...result };
  }),
);

// Login
router.post(
  "/login",
  validation(loginSchema),
  sendResponse<ILoginRes>(async (req) => {
    const { body } = getReqData<TLoginDTO>(req);

    const result = await authService.login(body);

    return result;
  }),
);

// Verify Login - Two-Step Verification
router.post(
  "/verify-login",
  validation(verifyOTPSchema),
  sendResponse<IAuthRes>(async (req) => {
    const { body } = getReqData<TVerifyOTPDTO>(req);

    const result = await authService.verifyLogin(body);

    return result;
  }),
);

// Refresh Token
router.post(
  "/refresh-token",
  authentication(false),
  sendResponse<IAuthRes>(async (req) => {
    const user = getAuthUser(req);

    const result = await authService.refreshTokens(user);

    return result;
  }),
);

// Logout
router.post(
  "/logout",
  authentication(),
  validation(logoutSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { query } = getReqData<TLogoutDTO>(req);
    const user = getAuthUser(req);

    const result = await authService.logout(user, query.mode);

    return result;
  }),
);

// Confirm Email
router.post(
  "/confirm-email",
  validation(verifyOTPSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TVerifyOTPDTO>(req);

    const result = await authService.confirmEmail(body);

    return result;
  }),
);

// Resend Email Confirmation OTP
router.post(
  "/resend-email",
  validation(sendOTPSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TSendOTPDTO>(req);

    const result = await authService.resendEmail(body);

    return result;
  }),
);

// Request OTP to reset password
router.post(
  "/forgot-password",
  validation(sendOTPSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TSendOTPDTO>(req);

    const result = await authService.forgotPassword(body);

    return result;
  }),
);

// Reset Password OTP Verification
router.post(
  "/forgot-password-verify",
  validation(verifyOTPSchema),
  sendResponse<IVerifyPasswordRes>(async (req) => {
    const { body } = getReqData<TVerifyOTPDTO>(req);

    const result = await authService.verifyPasswordOTP(body);

    return result;
  }),
);

// Reset Password
router.post(
  "/reset-password",
  validation(resetPasswordSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TResetPasswordDTO>(req);

    const result = await authService.resetPassword(body);

    return result;
  }),
);

// Request OTP to enable two-step verification
router.post(
  "/two-step-verification",
  validation(sendOTPSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TSendOTPDTO>(req);

    const result = await authService.twoStepVerification(body);

    return result;
  }),
);

// Verify OTP and enable Two-Step Verification
router.post(
  "/enable-two-step-verification",
  validation(verifyOTPSchema),
  sendResponse<IBasicResponse>(async (req) => {
    const { body } = getReqData<TVerifyOTPDTO>(req);

    const result = await authService.enableTwoStepVerification(body);

    return result;
  }),
);

export default router;
