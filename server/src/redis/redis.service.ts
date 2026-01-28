import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error(" REDIS_URL is not defined");
    }

    this.redis = new Redis(redisUrl);

    // Optional but VERY useful in production
    this.redis.on("connect", () => {
      console.log("redis connected");
    });

    this.redis.on("error", (err) => {
      console.error(" Redis error", err);
    });
  }

  get client(): Redis {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
