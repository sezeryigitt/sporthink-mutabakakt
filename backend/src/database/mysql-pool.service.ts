import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, Pool } from 'mysql2/promise';
import { URL } from 'node:url';
import { getDatabaseUrl } from '../config/database-url.util';

@Injectable()
export class MysqlPoolService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor(private readonly config: ConfigService) {
    const databaseUrl = getDatabaseUrl(config);
    const parsed = new URL(databaseUrl);
    const sslEnabled = config.get<string>('MYSQL_SSL', 'true') !== 'false';

    const port = config.get<string>('MYSQL_PORT') ?? parsed.port;

    this.pool = createPool({
      host: config.get<string>('MYSQL_HOST') ?? parsed.hostname,
      port: port ? Number(port) : 3306,
      database: config.get<string>('MYSQL_DATABASE') ?? parsed.pathname.slice(1),
      user: config.get<string>('MYSQL_USER') ?? decodeURIComponent(parsed.username),
      password: config.get<string>('MYSQL_PASSWORD') ?? decodeURIComponent(parsed.password),
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: false,
      supportBigNumbers: true,
      bigNumberStrings: true,
      decimalNumbers: false,
      ssl: sslEnabled ? { rejectUnauthorized: true } : undefined,
      enableKeepAlive: true,
    });
  }

  getPool(): Pool {
    return this.pool;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
