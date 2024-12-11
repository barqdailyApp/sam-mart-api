import { CacheModule } from "@nestjs/cache-manager";


export default () => (
  CacheModule.register({
    isGlobal: true,
    ttl: 0, // seconds
    max: 1000, 
  })
);