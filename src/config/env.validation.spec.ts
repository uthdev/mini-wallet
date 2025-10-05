import 'reflect-metadata';
import { validateEnvironmentVariables } from './env.validation';

describe('Environment Validation', () => {
  const validConfig = {
    PORT: 3000,
    NODE_ENV: 'development',
    DB_HOST: 'localhost',
    DB_PORT: 5432,
    DB_USER: 'postgres',
    DB_PASS: 'password',
    DB_NAME: 'testdb',
    JWT_SECRET: 'secret123',
    ENCRYPTION_SECRET: 'encryption123',
    BLOCKCYPHER_BASE_URL: 'https://api.blockcypher.com/v1/btc/test3',
    BLOCKCYPHER_TOKEN: 'token123',
    FRONTEND_URL: 'http://localhost:3000',
  };

  it('should throw error for missing required variables', () => {
    const invalidConfig = { ...validConfig };
    delete invalidConfig.JWT_SECRET;

    expect(() => validateEnvironmentVariables(invalidConfig)).toThrow();
  });

  it('should throw error for invalid URL format', () => {
    const invalidConfig = {
      ...validConfig,
      FRONTEND_URL: 'invalid-url',
    };

    expect(() => validateEnvironmentVariables(invalidConfig)).toThrow();
  });

  it('should throw error for invalid NODE_ENV', () => {
    const invalidConfig = {
      ...validConfig,
      NODE_ENV: 'invalid',
    };

    expect(() => validateEnvironmentVariables(invalidConfig)).toThrow();
  });
});
