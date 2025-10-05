process.env.NODE_ENV = 'test';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as request from 'supertest';

describe('Mini Wallet E2E', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const registerRes = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation {
          register(input: {
            email: "test${Date.now()}@example.com",
            password: "Test1234",
            name: "Test User"
          }) { accessToken }
        }`,
      });
    accessToken = registerRes.body.data.register.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('should register a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            register(input: {
              email: "newuser${Date.now()}@example.com",
              password: "Test1234",
              name: "New User"
            }) { accessToken user { id email name } }
          }`,
        })
        .expect(200);

      expect(res.body.data.register.accessToken).toBeDefined();
      expect(res.body.data.register.user.email).toContain('@example.com');
    });

    it('should login existing user', async () => {
      const email = `login${Date.now()}@example.com`;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            register(input: {
              email: "${email}",
              password: "Test1234",
              name: "Login User"
            }) { accessToken }
          }`,
        });

      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            login(input: {
              email: "${email}",
              password: "Test1234"
            }) { accessToken user { email } }
          }`,
        })
        .expect(200);

      expect(res.body.data.login.accessToken).toBeDefined();
      expect(res.body.data.login.user.email).toBe(email);
    });

    it('should get current user', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          query: `{ me { id email name } }`,
        })
        .expect(200);

      expect(res.body.data.me.email).toBeDefined();
    });

    it('should fail login with invalid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `mutation {
            login(input: {
              email: "nonexistent@example.com",
              password: "WrongPass123"
            }) { accessToken user { email } }
          }`,
        })
        .expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe('Invalid credentials');
    });
  });

  describe('Wallet Operations', () => {
    it('should get empty wallets list for new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ query: `{ myWallets { id address balance } }` })
        .expect(200);

      expect(Array.isArray(res.body.data.myWallets)).toBe(true);
    });

    it('should require authentication for wallet operations', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({ query: `{ myWallets { id address balance } }` })
        .expect(200);

      expect(res.body.errors).toBeDefined();
    });
  });

  describe('Transaction Operations', () => {
    it('should require authentication for transaction operations', async () => {
      const res = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `{ walletTransactions(walletId: "fake-id") { id status } }`,
        })
        .expect(200);

      expect(res.body.errors).toBeDefined();
    });
  });
});
