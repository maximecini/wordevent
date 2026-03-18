import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/http-exception.filter';
import { cleanDatabase, closeTestPool } from './helpers/db.helper';

const AUTH_REGISTER = '/api/auth/register';
const AUTH_LOGIN = '/api/auth/login';

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

async function registerAndLogin(email: string, password = 'Password123!'): Promise<string> {
  await request(app.getHttpServer())
    .post(AUTH_REGISTER)
    .send({ email, name: 'Test User', password });

  const res = await request(app.getHttpServer())
    .post(AUTH_LOGIN)
    .send({ email, password });

  return res.body.accessToken as string;
}

async function createEvent(token: string, capacity = 5) {
  const res = await request(app.getHttpServer())
    .post('/api/events')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Event',
      lat: 48.8566,
      lng: 2.3522,
      capacity,
      startAt: new Date(Date.now() + 3600_000).toISOString(),
      endAt: new Date(Date.now() + 7200_000).toISOString(),
    });
  return res.body as { id: string };
}

function joinUrl(eventId: string) { return `/api/events/${eventId}/join`; }
function leaveUrl(eventId: string) { return `/api/events/${eventId}/leave`; }
function participantsUrl(eventId: string) { return `/api/events/${eventId}/participants`; }

function describeJoin() {
  describe('POST /api/events/:id/join', () => {
    it('should return 204 when user joins a public event', async () => {
      const creatorToken = await registerAndLogin('creator@part.com');
      const memberToken = await registerAndLogin('member@part.com');
      const event = await createEvent(creatorToken);
      const res = await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(204);
    });

    it('should return 403 when creator tries to join own event', async () => {
      const creatorToken = await registerAndLogin('creator2@part.com');
      const event = await createEvent(creatorToken);
      const res = await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${creatorToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 409 when user tries to join twice', async () => {
      const creatorToken = await registerAndLogin('creator3@part.com');
      const memberToken = await registerAndLogin('member3@part.com');
      const event = await createEvent(creatorToken);
      await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      const res = await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(409);
    });

    it('should return 400 when event capacity is reached', async () => {
      const creatorToken = await registerAndLogin('creator4@part.com');
      const event = await createEvent(creatorToken, 1);
      const member1Token = await registerAndLogin('member4a@part.com');
      await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${member1Token}`);
      const member2Token = await registerAndLogin('member4b@part.com');
      const res = await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${member2Token}`);
      expect(res.status).toBe(400);
    });

    it('should return 404 for an unknown event', async () => {
      const token = await registerAndLogin('member5@part.com');
      const res = await request(app.getHttpServer())
        .post(joinUrl('00000000-0000-0000-0000-000000000000'))
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it('should return 401 without token', async () => {
      const creatorToken = await registerAndLogin('creator6@part.com');
      const event = await createEvent(creatorToken);
      const res = await request(app.getHttpServer()).post(joinUrl(event.id));
      expect(res.status).toBe(401);
    });
  });
}

function describeLeave() {
  describe('DELETE /api/events/:id/leave', () => {
    it('should return 204 when participant leaves', async () => {
      const creatorToken = await registerAndLogin('creator7@part.com');
      const memberToken = await registerAndLogin('member7@part.com');
      const event = await createEvent(creatorToken);
      await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      const res = await request(app.getHttpServer())
        .delete(leaveUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(204);
    });

    it('should return 403 when creator tries to leave own event', async () => {
      const creatorToken = await registerAndLogin('creator8@part.com');
      const event = await createEvent(creatorToken);
      const res = await request(app.getHttpServer())
        .delete(leaveUrl(event.id))
        .set('Authorization', `Bearer ${creatorToken}`);
      expect(res.status).toBe(403);
    });

    it('should return 404 when user is not a participant', async () => {
      const creatorToken = await registerAndLogin('creator9@part.com');
      const memberToken = await registerAndLogin('member9@part.com');
      const event = await createEvent(creatorToken);
      const res = await request(app.getHttpServer())
        .delete(leaveUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      expect(res.status).toBe(404);
    });
  });
}

function describeParticipants() {
  describe('GET /api/events/:id/participants', () => {
    it('should return 200 with the participant list', async () => {
      const creatorToken = await registerAndLogin('creator10@part.com');
      const memberToken = await registerAndLogin('member10@part.com');
      const event = await createEvent(creatorToken);
      await request(app.getHttpServer())
        .post(joinUrl(event.id))
        .set('Authorization', `Bearer ${memberToken}`);
      const res = await request(app.getHttpServer())
        .get(participantsUrl(event.id))
        .set('Authorization', `Bearer ${creatorToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 for an unknown event', async () => {
      const token = await registerAndLogin('member11@part.com');
      const res = await request(app.getHttpServer())
        .get(participantsUrl('00000000-0000-0000-0000-000000000000'))
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
}

describe('Participations (e2e)', () => {
  setupApp();
  beforeEach(async () => { await cleanDatabase(); });
  describeJoin();
  describeLeave();
  describeParticipants();
});
