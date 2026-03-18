import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { cleanDatabase, closeTestPool } from './helpers/db.helper';

const REGISTER_URL = '/api/auth/register';
const LOGIN_URL = '/api/auth/login';
const REFRESH_URL = '/api/auth/refresh';
const ME_URL = '/api/auth/me';

const DEFAULT_USER = {
  email: 'test@example.com',
  password: 'Password123!',
  name: 'Test User',
};

let app: INestApplication;

async function setupApp() {
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closeTestPool();
  });
}

async function registerUser(
  email = DEFAULT_USER.email,
  password = DEFAULT_USER.password,
  name = DEFAULT_USER.name,
) {
  return request(app.getHttpServer()).post(REGISTER_URL).send({ email, password, name });
}

async function loginUser(email = DEFAULT_USER.email, password = DEFAULT_USER.password) {
  return request(app.getHttpServer()).post(LOGIN_URL).send({ email, password });
}

function describeRegister() {
  describe('POST /api/auth/register', () => {
    it('should return 201 with accessToken and refreshToken', async () => {
      const res = await registerUser();
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 409 when email already taken', async () => {
      await registerUser();
      const res = await registerUser();
      expect(res.status).toBe(409);
    });

    it('should return 400 when email is invalid', async () => {
      const res = await registerUser('not-an-email');
      expect(res.status).toBe(400);
    });

    it('should return 400 when password is too short', async () => {
      const res = await registerUser(DEFAULT_USER.email, 'short');
      expect(res.status).toBe(400);
    });

    it('should return 400 when name is missing', async () => {
      const res = await request(app.getHttpServer())
        .post(REGISTER_URL)
        .send({ email: DEFAULT_USER.email, password: DEFAULT_USER.password });
      expect(res.status).toBe(400);
    });
  });
}

function describeLogin() {
  describe('POST /api/auth/login', () => {
    it('should return 201 with tokens on valid credentials', async () => {
      await registerUser();
      const res = await loginUser();
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 401 on wrong password', async () => {
      await registerUser();
      const res = await loginUser(DEFAULT_USER.email, 'wrongpassword');
      expect(res.status).toBe(401);
    });

    it('should return 401 on unknown email', async () => {
      const res = await loginUser('unknown@example.com', 'Password123!');
      expect(res.status).toBe(401);
    });
  });
}

function describeRefresh() {
  describe('POST /api/auth/refresh', () => {
    it('should return new tokens with valid refreshToken', async () => {
      const reg = await registerUser();
      const refreshToken: string = reg.body.refreshToken;
      const res = await request(app.getHttpServer())
        .post(REFRESH_URL)
        .send({ refreshToken });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 401 with an invalid refreshToken', async () => {
      const res = await request(app.getHttpServer())
        .post(REFRESH_URL)
        .send({ refreshToken: 'invalid.token.here' });
      expect(res.status).toBe(401);
    });

    it('should return 400 when refreshToken is missing', async () => {
      const res = await request(app.getHttpServer()).post(REFRESH_URL).send({});
      expect(res.status).toBe(400);
    });
  });
}

function describeMe() {
  describe('GET /api/auth/me', () => {
    it('should return user profile with valid accessToken', async () => {
      const reg = await registerUser();
      const token: string = reg.body.accessToken;
      const res = await request(app.getHttpServer())
        .get(ME_URL)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).not.toHaveProperty('password');
      expect(res.body).not.toHaveProperty('refreshToken');
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get(ME_URL);
      expect(res.status).toBe(401);
    });
  });
}

describe('Auth (e2e)', () => {
  setupApp();
  beforeEach(async () => { await cleanDatabase(); });
  describeRegister();
  describeLogin();
  describeRefresh();
  describeMe();
});
