import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return configuration from environment', () => {
    const config = configuration();

    expect(config).toHaveProperty('port');
    expect(config).toHaveProperty('nodeEnv');
    expect(config).toHaveProperty('database');
    expect(config.database).toHaveProperty('host');
    expect(config.database).toHaveProperty('port');
    expect(config.database).toHaveProperty('user');
    expect(config.database).toHaveProperty('pass');
    expect(config.database).toHaveProperty('name');
    expect(config).toHaveProperty('jwt');
    expect(config.jwt).toHaveProperty('secret');
    expect(config.jwt).toHaveProperty('expiresIn');
    expect(config).toHaveProperty('encryption');
    expect(config.encryption).toHaveProperty('secret');
    expect(config).toHaveProperty('blockcypher');
    expect(config.blockcypher).toHaveProperty('baseUrl');
    expect(config.blockcypher).toHaveProperty('token');
    expect(config).toHaveProperty('frontendUrl');
  });

  it('should use environment variables when provided', () => {
    const originalPort = process.env.PORT;
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDbHost = process.env.DB_HOST;
    const originalJwtSecret = process.env.JWT_SECRET;

    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'prod-db';
    process.env.JWT_SECRET = 'secret123';

    const config = configuration();

    expect(config.port).toBe(4000);
    expect(config.nodeEnv).toBe('production');
    expect(config.database.host).toBe('prod-db');
    expect(config.jwt.secret).toBe('secret123');

    // Restore original values
    process.env.PORT = originalPort;
    process.env.NODE_ENV = originalNodeEnv;
    process.env.DB_HOST = originalDbHost;
    process.env.JWT_SECRET = originalJwtSecret;
  });
});
