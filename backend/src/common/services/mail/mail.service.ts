import { createTransport, type Mail } from "nodemailer";
import config from "../../../config";
import { MAIL_DETAILS } from "../../constants";
import { MAIL_SUBJECT } from "../../enums";
import {
  confirmEmailTemplate,
  resetPasswordTemplate,
  twoStepVerificationTemplate,
} from "./mail.template";

type TTemplateData = {
  subject: MAIL_SUBJECT;
  name: string;
  otp: string;
};

class MailService {
  private transporter: Mail;

  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: config.googleMail.user,
        pass: config.googleMail.password,
      },
    });
  }

  async verifyConnection() {
    console.log("Verifying mail server connection...");

    await this.transporter.verify();

    console.log("Mail server is ready to take our messages");
  }

  private getTemplate({ subject, name, otp }: TTemplateData): {
    subject: string;
    html?: string;
    text?: string;
  } {
    const { title = "Notification", expiresIn = 3 * 60 } =
      MAIL_DETAILS[subject];

    const templateData = { title, name, otp, expiresInMin: expiresIn / 60 };

    switch (subject) {
      case MAIL_SUBJECT.CONFIRMATION:
        return {
          subject: title,
          html: confirmEmailTemplate(templateData),
        };
      case MAIL_SUBJECT.RESET_PASSWORD:
        return {
          subject: title,
          html: resetPasswordTemplate(templateData),
        };
      case MAIL_SUBJECT.VERIFICATION:
        return {
          subject: title,
          html: twoStepVerificationTemplate(templateData),
        };
      default:
        return { subject: "Social App", text: "Notification" };
    }
  }

  async sendMail({
    email,
    subject,
    name,
    otp,
  }: TTemplateData & { email: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Social App" <${config.googleMail.user}>`,
        to: email,
        ...this.getTemplate({ subject, name, otp }),
      });

      console.log("Message sent ", info.messageId);
    } catch (err) {
      console.error("Error while sending mail:", err);
    }
  }
}

const mailService = new MailService();

export { mailService };
