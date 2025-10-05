export default () => ({
  // App
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Database
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'postgres',
    pass: process.env.DB_PASS ?? 'postgres',
    name: process.env.DB_NAME ?? 'walletdb',
  },

  // Security
  jwt: {
    secret: process.env.JWT_SECRET ?? 'changeme',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  encryption: {
    secret: process.env.ENCRYPTION_SECRET ?? 'changeme',
  },

  // BlockCypher
  blockcypher: {
    baseUrl:
      process.env.BLOCKCYPHER_BASE_URL ??
      'https://api.blockcypher.com/v1/btc/test3',
    token: process.env.BLOCKCYPHER_TOKEN ?? '',
  },

  // Frontend
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
});
