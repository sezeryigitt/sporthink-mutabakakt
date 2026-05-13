import { ConfigService } from '@nestjs/config';

export function getDatabaseUrl(config: ConfigService): string {
  const directUrl = config.get<string>('DATABASE_URL');
  if (directUrl) {
    return directUrl;
  }

  const host = requireValue(config, 'MYSQL_HOST');
  const port = config.get<string>('MYSQL_PORT', '3306');
  const database = requireValue(config, 'MYSQL_DATABASE');
  const user = encodeURIComponent(requireValue(config, 'MYSQL_USER'));
  const password = encodeURIComponent(requireValue(config, 'MYSQL_PASSWORD'));
  const ssl = config.get<string>('MYSQL_SSL', 'true') !== 'false';
  const sslQuery = ssl ? '?sslaccept=strict' : '';

  return `mysql://${user}:${password}@${host}:${port}/${database}${sslQuery}`;
}

export function requireValue(config: ConfigService, key: string): string {
  const value = config.get<string>(key);
  if (!value) {
    throw new Error(`${key} is required.`);
  }
  return value;
}
