import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppThrottlerGuard } from './guards/app-throttler.guard';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const throttlers = [
          {
            ttl: configService.get<number>('throttler.ttl') || 60000,
            limit: configService.get<number>('throttler.limit') || 10,
          },
        ];

        return {
          throttlers,
        };
      },
    }),
  ],

  providers: [{ provide: APP_GUARD, useClass: AppThrottlerGuard }],
})
export class AppThrottlerModule {}
