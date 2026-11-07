import {
  AUTH_PROVIDER,
  LOGOUT_MODE,
  MAIL_SUBJECT,
  USER_ROLE,
} from "../../common/enums";
import config from "../../config";
import {
  jwtService,
  otpService,
  oauthService,
} from "../../common/services/auth";
import {
  buildLoginKey,
  buildRevokeKey,
  redisService,
} from "../../common/services/redis";
import {
  BadRequestException,
  ConflictException,
  InternalServerException,
} from "../../common/exceptions";
import { compare } from "../../common/services/security";
import { userRepository, userService } from "../users";
import { MAIL_DETAILS } from "../../common/constants";
import type {
  IAuthRes,
  IGoogleAuthRes,
  ILoginRes,
  IRegisterRes,
  IVerifyPasswordRes,
  TGoogleAuthDTO,
  TLoginDTO,
  TRegisterDTO,
  TResetPasswordDTO,
  TSendOTPDTO,
  TVerifyOTPDTO,
} from "./auth.dto";
import type { JwtPayload } from "jsonwebtoken";
import type { IBasicResponse } from "../../common/types";

class AuthService {
  async signup(userData: TRegisterDTO["body"]): Promise<IRegisterRes> {
    const user = await userRepository.exists({ email: userData.email });

    if (user) {
      throw new ConflictException("Email already exists");
    }

    const newUser = await userRepository.create({
      ...userData,
      provider: AUTH_PROVIDER.LOCAL,
    });

    if (!newUser) {
      throw new InternalServerException("Failed to create new user");
    }

    const subject = MAIL_SUBJECT.CONFIRMATION;
    const expiresIn = MAIL_DETAILS[subject].expiresIn;

    otpService.sendOTP({
      userData: { id: newUser.id, email: newUser.email, name: newUser.name },
      subject,
      expiresIn,
    });

    return { message: "User created successfully", data: { id: newUser.id } };
  }

  async login(userData: TLoginDTO["body"]): Promise<ILoginRes> {
    const { email, password } = userData;

    const user = await userRepository.findOne({ email });
    if (!user) {
      throw new BadRequestException("Invalid email or password");
    }

    if (!user.emailConfirmed) {
      throw new BadRequestException(
        "Email is not confirmed. Please confirm your email before logging in.",
      );
    }

    const {
      password: userPassword,
      name,
      role = USER_ROLE.USER,
      provider = AUTH_PROVIDER.LOCAL,
      id,
    } = user;

    const maxTrials = 5;
    const bannedFor = 5 * 60;
    const trialsKey = buildLoginKey(id);

    await otpService.checkTrials(trialsKey, maxTrials);

    if (provider !== AUTH_PROVIDER.LOCAL) {
      throw new BadRequestException("Invalid email or password");
    }

    const match = await compare(password, userPassword || "");
    if (!match) {
      const trials = await redisService.incrBy(trialsKey, 1);

      if (trials === maxTrials) {
        await redisService.expire(trialsKey, bannedFor);
      }

      throw new BadRequestException("Invalid email or password");
    }

    if (user.twoStepVerificationEnabled === true) {
      const subject = MAIL_SUBJECT.VERIFICATION;
      const expiresIn = MAIL_DETAILS[subject].expiresIn;

      otpService.sendOTP({
        userData: { id, email, name },
        subject,
        expiresIn,
      });

      return {
        message: "Two-Step Verification OTP sent successfully",
        twoStepVerificationEnabled: true,
      };
    }

    const tokens = jwtService.getTokens({ sub: id, role }, role);

    return {
      message: "User logged in successfully",
      data: tokens,
      twoStepVerificationEnabled: false,
    };
  }

  async verifyLogin({ email, otp }: TVerifyOTPDTO["body"]): Promise<IAuthRes> {
    const user = await userRepository.findOne(
      { email },
      { _id: 1, role: 1, twoStepVerificationEnabled: 1 },
    );

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (!user.twoStepVerificationEnabled) {
      throw new BadRequestException(
        "Two-Step Verification is not enabled for this user",
      );
    }

    const subject = MAIL_SUBJECT.VERIFICATION;
    const { maxTrials, bannedFor } = MAIL_DETAILS[subject];

    await otpService.verifyOTP({
      userId: user.id,
      otp,
      subject,
      maxTrials,
      bannedFor,
    });

    const tokens = jwtService.getTokens(
      { sub: user.id, role: user.role },
      user.role,
    );

    return { message: "User logged in successfully", data: tokens };
  }

  async resendLogin({ email }: TSendOTPDTO["body"]): Promise<IBasicResponse> {
    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (!user.twoStepVerificationEnabled) {
      throw new BadRequestException(
        "Two-Step Verification is not enabled for this user",
      );
    }

    const subject = MAIL_SUBJECT.VERIFICATION;
    const { maxTrials, expiresIn } = MAIL_DETAILS[subject];

    await otpService.resendOTP({
      userData: { id: user.id, name: user.name, email: user.email },
      subject,
      maxTrials,
      expiresIn,
    });

    return { message: "Login OTP sent successfully" };
  }

  async refreshTokens(userPayload: JwtPayload): Promise<IAuthRes> {
    const { sub, role, iat } = userPayload;

    const elapsedSec = Math.floor(Date.now() / 1000) - iat!;

    if (elapsedSec < config.jwtExpiresIn.accessKey) {
      throw new BadRequestException(
        "Cannot refresh access token before expiration",
      );
    }

    const tokens = jwtService.getTokens({ sub: sub!, role }, role);

    return { message: "Tokens refreshed successfully", data: tokens };
  }

  async handleGoogleAuth({
    credential,
  }: TGoogleAuthDTO["body"]): Promise<IGoogleAuthRes> {
    const { email, name, image } =
      await oauthService.verifyGoogleIdToken(credential);

    const user = await userRepository.findOne({ email });

    let sub: string,
      isNew = true;
    if (!user) {
      const newUser = await userRepository.create({
        email,
        name: name ?? "",
        image: image ?? undefined,
        provider: AUTH_PROVIDER.GOOGLE,
        emailConfirmed: true,
        role: USER_ROLE.USER,
      });

      sub = newUser.id;
    } else if (user.provider !== AUTH_PROVIDER.GOOGLE) {
      throw new ConflictException(
        "An account already exists with this email, log in with your password instead",
      );
    } else {
      sub = user.id;
      isNew = false;
    }

    const role = USER_ROLE.USER;
    const tokens = jwtService.getTokens({ sub, role }, role);

    return {
      message: `User ${isNew ? "created" : "logged in"} successfully`,
      data: tokens,
      isNew,
    };
  }

  async logout(user: JwtPayload, mode: LOGOUT_MODE): Promise<IBasicResponse> {
    if (mode === LOGOUT_MODE.ALL) {
      await userService.deleteUserResources(user.id);

      return { message: "User logged out successfully" };
    }

    const key = buildRevokeKey(user.id, user.jti!);
    const ttl =
      config.jwtExpiresIn.refreshKey -
      (Math.floor(Date.now() / 1000) - user.iat!);

    if (ttl > 0) {
      await redisService.set(key, user.jti!, ttl);
    }

    return { message: "User logged out successfully" };
  }

  async confirmEmail({
    email,
    otp,
  }: TVerifyOTPDTO["body"]): Promise<IBasicResponse> {
    const user = await userRepository.findOne(
      { email },
      { _id: 1, emailConfirmed: 1 },
    );

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (user.emailConfirmed === true) {
      throw new BadRequestException("Email is already confirmed");
    }

    const subject = MAIL_SUBJECT.CONFIRMATION;
    const { maxTrials, bannedFor } = MAIL_DETAILS[subject];

    await otpService.verifyOTP({
      userId: user._id.toString(),
      otp,
      subject,
      maxTrials,
      bannedFor,
    });

    await userRepository.updateOne({ _id: user._id }, { emailConfirmed: true });

    return { message: "Email confirmed successfully" };
  }

  async resendEmail({ email }: TSendOTPDTO["body"]): Promise<IBasicResponse> {
    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (user.emailConfirmed === true) {
      throw new BadRequestException("Email is already confirmed");
    }

    const subject = MAIL_SUBJECT.CONFIRMATION;
    const { maxTrials, expiresIn } = MAIL_DETAILS[subject];

    await otpService.resendOTP({
      userData: { id: user.id, name: user.name, email: user.email },
      subject,
      maxTrials,
      expiresIn,
    });

    return { message: "Email confirmation sent successfully" };
  }

  async forgotPassword({
    email,
  }: TSendOTPDTO["body"]): Promise<IBasicResponse> {
    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (!user.emailConfirmed) {
      throw new BadRequestException(
        "Email is not confirmed. Please confirm your email before resetting password.",
      );
    }

    const subject = MAIL_SUBJECT.RESET_PASSWORD;
    const { maxTrials, expiresIn } = MAIL_DETAILS[subject];

    await otpService.resendOTP({
      userData: { id: user.id, name: user.name, email },
      subject,
      maxTrials,
      expiresIn,
    });

    return { message: "Password reset OTP sent successfully" };
  }

  async verifyPasswordOTP(
    { email, otp }: TVerifyOTPDTO["body"],
    returnId = false,
  ): Promise<IVerifyPasswordRes> {
    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (!user.emailConfirmed) {
      throw new BadRequestException(
        "Email is not confirmed. Please confirm your email before resetting password.",
      );
    }

    const subject = MAIL_SUBJECT.RESET_PASSWORD;
    const { maxTrials, bannedFor } = MAIL_DETAILS[subject];

    await otpService.verifyOTP({
      userId: user.id,
      otp,
      subject,
      maxTrials,
      bannedFor,
      deleteKeys: false,
    });

    return {
      message: "Password reset OTP verified successfully",
      userId: returnId ? user.id : undefined,
    };
  }

  async resetPassword({
    email,
    otp,
    password,
  }: TResetPasswordDTO["body"]): Promise<IBasicResponse> {
    const { userId } = await this.verifyPasswordOTP({ email, otp }, true);

    await userRepository.updateOne({ email }, { password });

    await userService.deleteUserResources(userId!);

    return { message: "Password reset successfully" };
  }

  async twoStepVerification({
    email,
  }: TSendOTPDTO["body"]): Promise<IBasicResponse> {
    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (user.twoStepVerificationEnabled === true) {
      throw new BadRequestException("Two-Step Verification is already enabled");
    }

    const subject = MAIL_SUBJECT.VERIFICATION;
    const { maxTrials, expiresIn } = MAIL_DETAILS[subject];

    await otpService.resendOTP({
      userData: { id: user.id, name: user.name, email: user.email },
      subject,
      maxTrials,
      expiresIn,
    });

    return { message: "Two-Step Verification OTP sent successfully" };
  }

  async enableTwoStepVerification({
    email,
    otp,
  }: TVerifyOTPDTO["body"]): Promise<IBasicResponse> {
    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException("Invalid credentials");
    }

    if (user.twoStepVerificationEnabled === true) {
      throw new BadRequestException("Two-Step Verification is already enabled");
    }

    const subject = MAIL_SUBJECT.VERIFICATION;
    const { maxTrials, bannedFor } = MAIL_DETAILS[subject];

    await otpService.verifyOTP({
      userId: user.id,
      otp,
      subject,
      maxTrials,
      bannedFor,
    });

    await userRepository.updateOne(
      { _id: user._id },
      {
        twoStepVerificationEnabled: true,
        emailConfirmed: true, // Mark email as confirmed when enabling two-step verification
      },
    );

    return { message: "Two-Step Verification enabled successfully" };
  }
}

const authService = new AuthService();

export { authService };
