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

  it('should return default configuration', () => {
    const config = configuration();

    expect(config).toEqual({
      port: 3000,
      nodeEnv: 'test',
      database: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        pass: 'postgres',
        name: 'walletdb',
      },
      jwt: {
        secret: 'changeme',
        expiresIn: '1d',
      },
      encryption: {
        secret: 'changeme',
      },
      blockcypher: {
        baseUrl: 'https://api.blockcypher.com/v1/btc/test3',
        token: '',
      },
      frontendUrl: 'http://localhost:5173',
    });
  });

  it('should use environment variables when provided', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.DB_HOST = 'prod-db';
    process.env.JWT_SECRET = 'secret123';

    const config = configuration();

    expect(config.port).toBe(4000);
    expect(config.nodeEnv).toBe('production');
    expect(config.database.host).toBe('prod-db');
    expect(config.jwt.secret).toBe('secret123');
  });
});
