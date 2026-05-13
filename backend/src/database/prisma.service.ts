import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl } from '../config/database-url.util';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: getDatabaseUrl(config),
        },
      },
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
