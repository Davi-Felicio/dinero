/// <reference types="jest" />
import 'dotenv/config';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const request = require('supertest');
import { HttpExceptionFilter } from '@dinero/shared';
import { IdentityModule } from '../src/identity.module';
import { PrismaService } from '../src/infrastructure/prisma/prisma.service';

describe('Profile flow (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const validUser = {
    name: 'João Silva',
    email: 'joao.e2e@example.com',
    password: 'Senha123',
    phone: '11999999999',
    location: 'Toledo',
  };

  beforeAll(async () => {
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'e2e-test-secret';

    const moduleRef = await Test.createTestingModule({
      imports: [IdentityModule],
    })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.setGlobalPrefix('v1/identity');
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.userPreference.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.userPreference.deleteMany();
      await prisma.user.deleteMany();
    }
    await app.close();
  });

  let accessToken: string;
  let userId: string;

  it('1. POST /auth/register cria usuário (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/identity/auth/register')
      .send(validUser)
      .expect(201);

    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.id).toBeDefined();
    userId = res.body.data.id;
  });

  it('2. POST /auth/register com email duplicado retorna 422', async () => {
    await request(app.getHttpServer())
      .post('/v1/identity/auth/register')
      .send(validUser)
      .expect(422);
  });

  it('3. POST /auth/login retorna 200 e accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/identity/auth/login')
      .send({ email: validUser.email, password: validUser.password })
      .expect(200);

    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  it('4. GET /users/me com token retorna 200 e dados do perfil', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/identity/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.email).toBe(validUser.email);
    expect(res.body.data.name).toBe(validUser.name);
  });

  it('5. GET /users/me sem token retorna 401', async () => {
    await request(app.getHttpServer())
      .get('/v1/identity/users/me')
      .expect(401);
  });

  it('6. PUT /users/me atualiza nome (200)', async () => {
    const res = await request(app.getHttpServer())
      .put('/v1/identity/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'João Atualizado' })
      .expect(200);

    expect(res.body.data.name).toBe('João Atualizado');
  });

  it('7. GET /users/:id retorna 200 + dados', async () => {
    const res = await request(app.getHttpServer())
      .get(`/v1/identity/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.data.id).toBe(userId);
    expect(res.body.data.email).toBe(validUser.email);
  });

  it('8. DELETE /users/me retorna 204', async () => {
    await request(app.getHttpServer())
      .delete('/v1/identity/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });

  it('9. POST /auth/login após delete retorna 401', async () => {
    await request(app.getHttpServer())
      .post('/v1/identity/auth/login')
      .send({ email: validUser.email, password: validUser.password })
      .expect(401);
  });
});
