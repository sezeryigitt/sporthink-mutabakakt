import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly database: DatabaseService) {}

  async check() {
    const startedAt = Date.now();

    try {
      const db = await this.database.ping();

      return {
        status: 'up',
        timestamp: new Date().toISOString(),
        response_ms: Date.now() - startedAt,
        dependencies: {
          database: {
            status: 'up',
            name: db.db_name,
            version: db.mysql_version,
            charset: db.charset_name,
            collation: db.collation_name,
          },
        },
      };
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        response_ms: Date.now() - startedAt,
        dependencies: {
          database: {
            status: 'down',
            message: error instanceof Error ? error.message : 'Unknown database error',
          },
        },
      };
    }
  }
}
