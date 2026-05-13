import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MysqlPoolService } from './mysql-pool.service';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [DatabaseService, MysqlPoolService, PrismaService],
  exports: [DatabaseService, PrismaService],
})
export class DatabaseModule {}
