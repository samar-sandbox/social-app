import { OAuth2Client } from "google-auth-library";
import config from "../../../config";
import { BadRequestException } from "../../exceptions";

class OAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client();
  }

  async verifyGoogleIdToken(token: string): Promise<{
    email: string;
    name: string | undefined;
    image: string | null;
  }> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: config.googleClient.webIds,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new BadRequestException("Invalid credentials");
    }

    const { email, email_verified, name, picture } = payload;

    if (!email_verified) {
      throw new BadRequestException("Unverified email address");
    }

    return { email: email as string, name, image: picture ?? null };
  }
}

const oauthService = new OAuthService();

export { oauthService };
