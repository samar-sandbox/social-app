export type TConfig = {
  dbURI: string;
  redisURL: string;
  port: number;
  encryptionKey: string;
  userJwtKeys: {
    accessKey: string;
    refreshKey: string;
  };
  adminJwtKeys: {
    accessKey: string;
    refreshKey: string;
  };
  jwtExpiresIn: {
    accessKey: number;
    refreshKey: number;
  };
  googleClient: {
    secret: string;
    webIds: string[];
  };
  googleMail: {
    user: string;
    password: string;
  };
  origins: string[];
};
