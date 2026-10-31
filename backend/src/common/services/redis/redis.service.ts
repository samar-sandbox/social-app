import { createClient, type RedisClientType } from "redis";
import config from "../../../config";

class RedisService {
  readonly client: RedisClientType;

  constructor() {
    this.client = createClient({ url: config.redisURL });
  }

  async connect() {
    console.log(`Connecting to redis...`);

    this.client.on("error", (err) => console.log("Redis Client Error", err));

    await this.client.connect();

    console.log("Redis connected successfully");
  }

  async set(key: string, value: string, ttl: number) {
    return this.client.set(key, value, {
      expiration: {
        type: "EX",
        value: ttl,
      },
    });
  }

  async get(key: string) {
    return this.client.get(key);
  }

  async getNum(key: string) {
    const value = await this.get(key);
    return value ? parseInt(value) : 0;
  }

  async setJson(key: string, value: Record<string, unknown>, ttl: number) {
    const jsonValue = JSON.stringify(value);
    return this.set(key, jsonValue, ttl);
  }

  async getJson(key: string) {
    const value = await this.get(key);
    if (!value) {
      return value;
    }
    return JSON.parse(value);
  }

  async del(key: string | string[]) {
    return this.client.del(key);
  }

  async exists(key: string) {
    const res = await this.client.exists(key);
    return res === 1;
  }

  async expire(key: string, seconds: number) {
    return this.client.expire(key, seconds);
  }

  async keys(prefix: string) {
    return this.client.keys(`${prefix}*`);
  }

  async incrBy(key: string, increment = 1) {
    return this.client.incrBy(key, increment);
  }

  async ttl(key: string) {
    return this.client.ttl(key);
  }
}

const redisService = new RedisService();

export { redisService };
