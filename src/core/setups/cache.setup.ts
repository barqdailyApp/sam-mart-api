import { CacheModule } from "@nestjs/cache-manager/dist";


export default () => (
  CacheModule.register({
    isGlobal: true,
    ttl: 5, // seconds
    max: 10, 
  })
);