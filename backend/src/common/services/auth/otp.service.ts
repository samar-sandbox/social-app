import type { MAIL_SUBJECT } from "../../enums";
import { BadRequestException } from "../../exceptions";
import { getOTP } from "../../utils/otp";
import { mailService } from "../mail";
import { buildOTPKeys, redisService } from "../redis";
import { compare, hash } from "../security";

type TUserData = { id: string; name: string; email: string };

type TOTPData = {
  userData: TUserData;
  subject: MAIL_SUBJECT;
  maxTrials?: number;
  expiresIn?: number;
};

type TOTPVerificationData = {
  userId: string;
  otp: string;
  subject: MAIL_SUBJECT;
  maxTrials: number;
  bannedFor: number;
  deleteKeys?: boolean;
};

class OTPService {
  async checkTrials(trialsKey: string, maxTrials: number) {
    const trials = await redisService.getNum(trialsKey);

    if (trials === maxTrials) {
      const remainingTime = await redisService.ttl(trialsKey);
      throw new BadRequestException(
        `Maximum trials exceeded. Please try again later in ${remainingTime} seconds.`,
      );
    }
  }

  async checkOTP(
    userId: string,
    subject: string,
    maxTrials: number,
  ): Promise<{
    otpKey: string;
    otp: string | null;
    trialsKey: string;
  }> {
    const { otpKey, trialsKey } = buildOTPKeys(userId, subject);

    await this.checkTrials(trialsKey, maxTrials);

    const otp = await redisService.get(otpKey);

    return { otpKey, otp, trialsKey };
  }

  async createOTP(key: string, expiresIn: number): Promise<string> {
    const otp = getOTP();
    const hashedOtp = await hash(otp);

    await redisService.set(key, hashedOtp, expiresIn);

    return otp;
  }

  async sendOTP({
    userData: { id, name, email },
    subject,
    expiresIn = 3 * 60,
  }: TOTPData) {
    const { otpKey } = buildOTPKeys(id, subject);

    const otp = await this.createOTP(otpKey, expiresIn);

    mailService.sendMail({ email, name, subject, otp });
  }

  async resendOTP({
    userData: { id, name, email },
    subject,
    maxTrials = 3,
    expiresIn = 3 * 60,
  }: TOTPData) {
    const { otpKey, otp: currentOtp } = await this.checkOTP(
      id,
      subject,
      maxTrials,
    );

    if (currentOtp) {
      throw new BadRequestException(
        "An OTP has already been sent. Please check your email.",
      );
    }

    const otp = await this.createOTP(otpKey, expiresIn);

    mailService.sendMail({ email, name, subject, otp });
  }

  async verifyOTP({
    userId,
    otp,
    subject,
    maxTrials = 3,
    bannedFor = 5 * 60,
    deleteKeys = true,
  }: TOTPVerificationData) {
    const {
      otpKey,
      otp: currentOtp,
      trialsKey,
    } = await this.checkOTP(userId, subject, maxTrials);

    if (!currentOtp) {
      throw new BadRequestException(
        "Invalid OTP. Please request a new one and try again.",
      );
    }

    const match = await compare(otp, currentOtp);
    if (!match) {
      const trials = await redisService.incrBy(trialsKey, 1);

      if (trials === maxTrials) {
        await redisService.expire(trialsKey, bannedFor);
      }

      throw new BadRequestException("Invalid OTP");
    }

    if (deleteKeys) {
      await redisService.del([otpKey, trialsKey]);
    }
  }
}

const otpService = new OTPService();

export { otpService };
