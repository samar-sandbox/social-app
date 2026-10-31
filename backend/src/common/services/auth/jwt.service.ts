import { sign, verify, decode } from "jsonwebtoken";
import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { USER_ROLE } from "../../enums";
import config from "../../../config";
import type { IPayload, ITokens } from "../../types";

class JwtService {
  private signToken(
    payload: IPayload,
    secret: string = config.userJwtKeys.accessKey,
    options: SignOptions,
  ): string {
    return sign(payload, secret, options);
  }

  verifyToken(
    token: string,
    secret: string = config.userJwtKeys.accessKey,
  ): JwtPayload {
    return verify(token, secret, { complete: false }) as JwtPayload;
  }

  decodeToken(token: string): JwtPayload | null {
    return decode(token, { json: true });
  }

  private getSecrets(role: USER_ROLE): {
    accessKey: string;
    refreshKey: string;
  } {
    switch (role) {
      case USER_ROLE.ADMIN:
        return config.adminJwtKeys;
      case USER_ROLE.USER:
      default:
        return config.userJwtKeys;
    }
  }

  getTokens(payload: IPayload, role: USER_ROLE = USER_ROLE.USER): ITokens {
    const { accessKey, refreshKey } = this.getSecrets(role);

    const jwtid = randomUUID();

    const { accessKey: accessKeyExp, refreshKey: refreshKeyExp } =
      config.jwtExpiresIn;

    const accessToken = this.signToken(payload, accessKey, {
      expiresIn: accessKeyExp,
      jwtid,
    });
    const refreshToken = this.signToken(payload, refreshKey, {
      expiresIn: refreshKeyExp,
      jwtid,
    });

    return { accessToken, refreshToken };
  }
}

const jwtService = new JwtService();

export { jwtService };
