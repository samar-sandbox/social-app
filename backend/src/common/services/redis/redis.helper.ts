export function buildUserKey(userId: string, prefix?: string) {
  let key = `user:${userId}`;

  if (prefix) {
    key += `:${prefix}`;
  }

  return key;
}

export function buildRevokeKey(userId: string, jti: string) {
  return buildUserKey(userId, `revoke:${jti}`);
}

export function buildOTPKeys(userId: string, subject: string) {
  const otpKey = buildUserKey(userId, `OTP:${subject}`);
  const trialsKey = `${otpKey}:trials`;

  return { otpKey, trialsKey };
}

export function buildLoginKey(userId: string) {
  return buildUserKey(userId, "login:trials");
}
