import { MAIL_SUBJECT } from "../enums";

type TMailDetails = Record<
  MAIL_SUBJECT,
  {
    title: string;
    expiresIn: number;
    bannedFor: number;
    maxTrials: number;
  }
>;

export const MAIL_DETAILS: TMailDetails = {
  [MAIL_SUBJECT.CONFIRMATION]: {
    title: "Confirm your email",
    expiresIn: 3 * 60,
    bannedFor: 5 * 60,
    maxTrials: 3,
  },
  [MAIL_SUBJECT.RESET_PASSWORD]: {
    title: "Reset your password",
    expiresIn: 3 * 60,
    bannedFor: 5 * 60,
    maxTrials: 3,
  },
  [MAIL_SUBJECT.VERIFICATION]: {
    title: "Verify it's you",
    expiresIn: 3 * 60,
    bannedFor: 5 * 60,
    maxTrials: 3,
  },
};
