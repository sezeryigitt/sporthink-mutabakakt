import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MysqlPoolService } from './mysql-pool.service';

export type QueryParam = string | number | boolean | Date | null;

@Injectable()
export class DatabaseService {
  constructor(private readonly mysqlPool: MysqlPoolService) {}

  async query<T extends RowDataPacket = RowDataPacket>(
    sql: string,
    params: QueryParam[] = [],
  ): Promise<T[]> {
    const [rows] = await this.mysqlPool.getPool().execute<T[]>(sql, params);
    return rows;
  }

  async execute(sql: string, params: QueryParam[] = []): Promise<ResultSetHeader> {
    const [result] = await this.mysqlPool.getPool().execute<ResultSetHeader>(sql, params);
    return result;
  }

  async ping() {
    const [mysqlInfo] = await this.query<{
      db_name: string;
      mysql_version: string;
      charset_name: string;
      collation_name: string;
    } & RowDataPacket>(
      'SELECT DATABASE() AS db_name, VERSION() AS mysql_version, @@character_set_database AS charset_name, @@collation_database AS collation_name',
    );

    return mysqlInfo;
  }
}
