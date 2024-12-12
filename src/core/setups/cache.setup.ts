import { CacheModule } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-store";


export default () => (
  CacheModule.register({
    isGlobal: true,
    ttl: 2000, // seconds
    max: 100, 
    store:redisStore,
    host: "localhost",
    port:6379
  })
);