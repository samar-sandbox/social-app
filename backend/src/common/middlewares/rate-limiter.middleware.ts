import type { RedisClientType } from "redis";
import { ipKeyGenerator, type Options, rateLimit } from "express-rate-limit";
// import geoip from "geoip-lite";
import { redisService } from "../services/redis";

class RedisStore {
  private window!: number;

  constructor(private client: RedisClientType) {}

  async init(options: Options) {
    this.window = options.windowMs / 1000;
  }

  async get(key: string) {
    const [hits, ttl] = await this.client
      .multi()
      .get(key)
      .ttl(key)
      .exec<"typed">();

    if (!hits) {
      return undefined;
    }

    return {
      totalHits: Number(hits),
      resetTime: new Date(Date.now() + ttl * 1000),
    };
  }

  async increment(key: string) {
    const [totalHits, ttl] = await this.client
      .multi()
      .incr(key)
      .ttl(key)
      .exec<"typed">();

    let t = ttl;
    if (t < 0) {
      await this.client.expire(key, this.window);
      t = this.window;
    }

    return {
      totalHits,
      resetTime: new Date(Date.now() + t * 1000),
    };
  }

  async decrement(key: string) {
    await this.client.decr(key);
  }

  async resetKey(key: string) {
    await this.client.del(key);
  }
}

// function getLocation(ip: string) {
//   return geoip.lookup(ip) || { country: undefined };
// }

export const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: (_req) => {
    // const { country } = getLocation(req.ip!);
    // return country === "EG" ? 5 : 0;
    return 5;
  },
  legacyHeaders: false,
  standardHeaders: "draft-8",
  handler: (_, res) =>
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
    }),
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip!, 56);
    return `${ip}:${req.path}`;
  },
  store: new RedisStore(redisService.client),
});
