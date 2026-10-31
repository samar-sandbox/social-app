import type { RequestHandler } from "express";
import type { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { USER_ROLE } from "../enums";
import {
  ForbiddenException,
  InternalServerException,
  UnauthorizedException,
} from "../exceptions";
import { jwtService } from "../services/auth";
import { buildRevokeKey, redisService } from "../services/redis";
import { userRepository } from "../../modules/users/user.repo";

function getSecret(isAccessToken: boolean, role: USER_ROLE): string {
  const key = isAccessToken ? "accessKey" : "refreshKey";

  switch (role) {
    case USER_ROLE.ADMIN:
      return config.adminJwtKeys[key];
    case USER_ROLE.USER:
    default:
      return config.userJwtKeys[key];
  }
}

async function checkToken(
  payload: JwtPayload,
  user: { tokensValidAfter?: Date },
) {
  if (
    user.tokensValidAfter &&
    Math.floor(new Date(user.tokensValidAfter).getTime() / 1000) >= payload.iat!
  ) {
    return { success: false };
  }

  const key = buildRevokeKey(payload.sub!, payload.jti!);
  const exist = await redisService.exists(key);

  return { success: !exist };
}

export function authentication(
  isAccessToken = true,
  isOptional = false,
): RequestHandler {
  return async function (req, _res, next) {
    const [, token] = req.headers.authorization?.split(" ") ?? [];

    if (!token) {
      if (isOptional) {
        return next();
      }

      throw new UnauthorizedException("Token not found");
    }

    let payload: JwtPayload;
    try {
      const decoded = jwtService.decodeToken(token);
      if (!decoded) {
        throw new UnauthorizedException("Token not found");
      }

      const secret = getSecret(isAccessToken, decoded.role);

      payload = jwtService.verifyToken(token, secret);
    } catch (error) {
      throw new UnauthorizedException("Invalid token");
    }

    const user = await userRepository.findById(payload.sub!, {
      tokensValidAfter: 1,
    });
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    const { success } = await checkToken(payload, user);
    if (!success) {
      throw new UnauthorizedException("Invalid token: token expired");
    }

    req.user = {
      ...payload,
      id: payload.sub!,
      sub: payload.sub!,
      role: payload.role,
    };
    next();
  };
}

export function requiredRoles(
  roles: USER_ROLE[] = [USER_ROLE.USER],
): RequestHandler {
  return function (req, _res, next) {
    const user = req.user;

    if (!user) {
      throw new InternalServerException("Missing user payload");
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException();
    }

    next();
  };
}
