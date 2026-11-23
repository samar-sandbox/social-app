export function buildUserKey(userId: string, path?: string) {
  let key = `user:${userId}`;

  if (path) {
    key += `:${path}`;
  }

  return key;
}
