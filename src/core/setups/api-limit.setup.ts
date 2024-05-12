import { ThrottlerModule } from '@nestjs/throttler';

export default () =>
  ThrottlerModule.forRoot([
    {
      ttl: 60000,
      limit: 1200,
    },
  ]);
