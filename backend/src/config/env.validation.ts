type Env = Record<string, string | undefined>;

export function validateEnv(config: Env) {
  const normalized: Env = {
    ...config,
    PORT: config.PORT ?? '3001',
    API_PREFIX: config.API_PREFIX ?? 'api',
    MYSQL_PORT: config.MYSQL_PORT ?? '3306',
    MYSQL_SSL: config.MYSQL_SSL ?? 'true',
    FRONTEND_ORIGIN: config.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    MICROSOFT_ALLOWED_DOMAINS:
      config.MICROSOFT_ALLOWED_DOMAINS ??
      config.MICROSOFT_ALLOWED_DOMAIN ??
      'sporthink.com.tr,ogr.deu.edu.tr',
    MICROSOFT_ALLOWED_TENANT_IDS:
      config.MICROSOFT_ALLOWED_TENANT_IDS ?? config.MICROSOFT_TENANT_ID,
    MICROSOFT_ADMIN_EMAILS: config.MICROSOFT_ADMIN_EMAILS ?? '',
    JWT_EXPIRES_IN: config.JWT_EXPIRES_IN ?? '8h',
  };

  const hasDatabaseUrl = Boolean(normalized.DATABASE_URL);
  const hasMysqlParts = [
    normalized.MYSQL_HOST,
    normalized.MYSQL_DATABASE,
    normalized.MYSQL_USER,
    normalized.MYSQL_PASSWORD,
  ].every(Boolean);

  if (!hasDatabaseUrl && !hasMysqlParts) {
    throw new Error(
      'Database configuration is missing. Provide DATABASE_URL or MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER and MYSQL_PASSWORD.',
    );
  }

  const requiredAuthKeys = [
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_AUTHORITY',
    'JWT_SECRET',
  ];

  for (const key of requiredAuthKeys) {
    if (!normalized[key]) {
      throw new Error(`${key} is required.`);
    }
  }

  const port = Number(normalized.PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }

  return {
    ...normalized,
    PORT: port,
  };
}
