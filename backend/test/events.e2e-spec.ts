import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { cleanDatabase, closeTestPool } from './helpers/db.helper';

const EVENTS_URL = '/api/events';

const BASE_EVENT = {
  title: 'Test Event',
  lat: 48.8566,
  lng: 2.3522,
  capacity: 10,
  startAt: new Date(Date.now() + 3600_000).toISOString(),
  endAt: new Date(Date.now() + 7200_000).toISOString(),
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

async function registerAndLogin(
  email = 'creator@example.com',
  password = 'Password123!',
): Promise<string> {
  await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ email, name: 'Test User', password });

  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password });

  return res.body.accessToken as string;
}

async function createEvent(token: string, overrides: Record<string, unknown> = {}) {
  return request(app.getHttpServer())
    .post(EVENTS_URL)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...BASE_EVENT, ...overrides });
}

function describeFindAll() {
  describe('GET /api/events', () => {
    it('should return 200 with an array of events', async () => {
      const token = await registerAndLogin();
      const res = await request(app.getHttpServer())
        .get(EVENTS_URL)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get(EVENTS_URL);
      expect(res.status).toBe(401);
    });
  });
}

function describeCreate() {
  describe('POST /api/events', () => {
    it('should return 201 with the created event', async () => {
      const token = await registerAndLogin();
      const res = await createEvent(token);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe(BASE_EVENT.title);
      expect(res.body).toHaveProperty('creatorId');
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post(EVENTS_URL)
        .send(BASE_EVENT);
      expect(res.status).toBe(401);
    });

    it('should return 400 when title is missing', async () => {
      const token = await registerAndLogin();
      const { title: _title, ...withoutTitle } = BASE_EVENT;
      const res = await createEvent(token, withoutTitle as any);
      expect(res.status).toBe(400);
    });

    it('should return 400 when capacity is less than 1', async () => {
      const token = await registerAndLogin();
      const res = await createEvent(token, { capacity: 0 });
      expect(res.status).toBe(400);
    });
  });
}

function describeFindOne() {
  describe('GET /api/events/:id', () => {
    it('should return 200 with the event', async () => {
      const token = await registerAndLogin();
      const created = await createEvent(token);
      const eventId: string = created.body.id;
      const res = await request(app.getHttpServer())
        .get(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(eventId);
    });

    it('should return 404 for an unknown event id', async () => {
      const token = await registerAndLogin();
      const res = await request(app.getHttpServer())
        .get(`${EVENTS_URL}/00000000-0000-0000-0000-000000000000`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
}

function describeUpdate() {
  describe('PATCH /api/events/:id', () => {
    it('should return 200 with updated event for the creator', async () => {
      const token = await registerAndLogin();
      const created = await createEvent(token);
      const eventId: string = created.body.id;
      const res = await request(app.getHttpServer())
        .patch(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Title' });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Title');
    });

    it('should return 403 when a non-creator tries to update', async () => {
      const creatorToken = await registerAndLogin('creator2@example.com');
      const otherToken = await registerAndLogin('other2@example.com');
      const created = await createEvent(creatorToken);
      const eventId: string = created.body.id;
      const res = await request(app.getHttpServer())
        .patch(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked' });
      expect(res.status).toBe(403);
    });
  });
}

function describeRemove() {
  describe('DELETE /api/events/:id', () => {
    it('should return 204 when creator deletes their event', async () => {
      const token = await registerAndLogin();
      const created = await createEvent(token);
      const eventId: string = created.body.id;
      const res = await request(app.getHttpServer())
        .delete(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });

    it('should return 403 when a non-creator tries to delete', async () => {
      const creatorToken = await registerAndLogin('creator3@example.com');
      const otherToken = await registerAndLogin('other3@example.com');
      const created = await createEvent(creatorToken);
      const eventId: string = created.body.id;
      const res = await request(app.getHttpServer())
        .delete(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${otherToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 404 for an already deleted event', async () => {
      const token = await registerAndLogin();
      const created = await createEvent(token);
      const eventId: string = created.body.id;
      await request(app.getHttpServer())
        .delete(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${token}`);
      const res = await request(app.getHttpServer())
        .delete(`${EVENTS_URL}/${eventId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
}

describe('Events (e2e)', () => {
  setupApp();
  beforeEach(async () => { await cleanDatabase(); });
  describeFindAll();
  describeCreate();
  describeFindOne();
  describeUpdate();
  describeRemove();
});
