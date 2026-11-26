import request from 'supertest';
import app from '../../src/app';
import {
  gameRepository,
  libraryRepository,
  userRepository,
} from '../../src/repositories';
import { gamesService } from '../../src/services';

describe('GameShelf API Integration', () => {
  beforeEach(() => {
    userRepository.clear();
    gameRepository.clear();
    libraryRepository.clear();
  });

  it('GET /api/health returns 200 { status: "ok" } and security headers', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rejects invalid registration payload with 400 and no internal details', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: '123',
      username: 'A',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'VALIDATION_ERROR');
    expect(res.body).toHaveProperty('message');
    expect(res.body.stack).toBeUndefined();
  });

  it('supports full auth, library CRUD, filtering, sorting, pagination, profile stats, and GDPR deletion', async () => {
    jest
      .spyOn(gamesService, 'getGameByRawgId')
      .mockImplementation(async (id) => ({
        rawgId: id,
        title: id === 100 ? 'Alpha Game' : 'Zelda Game',
        coverUrl: 'https://img.example.com/game.jpg',
        platforms: id === 100 ? ['PC'] : ['Nintendo Switch'],
        releaseYear: 2020,
        genres: ['RPG'],
        description: 'Test game',
        metacritic: 90,
      }));

    const reg1 = await request(app).post('/api/auth/register').send({
      email: 'alice@example.com',
      password: 'Password123',
      username: 'Alice',
    });
    expect(reg1.status).toBe(201);
    const token1 = reg1.body.token as string;

    const reg2 = await request(app).post('/api/auth/register').send({
      email: 'bob@example.com',
      password: 'Password123',
      username: 'Bob',
    });
    expect(reg2.status).toBe(201);
    const token2 = reg2.body.token as string;

    // Add 2 games for Alice
    const add1 = await request(app)
      .post('/api/library')
      .set('Authorization', `Bearer ${token1}`)
      .send({ rawgId: 100, status: 'COMPLETED' });
    expect(add1.status).toBe(201);

    const add2 = await request(app)
      .post('/api/library')
      .set('Authorization', `Bearer ${token1}`)
      .send({ rawgId: 200, status: 'PLAYING' });
    expect(add2.status).toBe(201);

    // Rate Alice's first game
    const patch1 = await request(app)
      .patch(`/api/library/${add1.body.id}`)
      .set('Authorization', `Bearer ${token1}`)
      .send({ rating: 9, review: 'Great!' });
    expect(patch1.status).toBe(200);

    // Bob cannot modify Alice's game
    const bobPatch = await request(app)
      .patch(`/api/library/${add1.body.id}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 1 });
    expect(bobPatch.status).toBe(403);

    // Filter, sort, paginate Alice's library
    const libRes = await request(app)
      .get('/api/library?status=COMPLETED&sort=title&order=asc&page=1&limit=10')
      .set('Authorization', `Bearer ${token1}`);
    expect(libRes.status).toBe(200);
    expect(libRes.body.total).toBe(1);
    expect(libRes.body.page).toBe(1);
    expect(libRes.body.items[0].game.title).toBe('Alpha Game');

    // Invalid query params -> 400
    const badQuery = await request(app)
      .get('/api/library?limit=999')
      .set('Authorization', `Bearer ${token1}`);
    expect(badQuery.status).toBe(400);

    // Profile & stats
    const statsRes = await request(app)
      .get('/api/me/stats')
      .set('Authorization', `Bearer ${token1}`);
    expect(statsRes.status).toBe(200);
    expect(statsRes.body).toEqual({
      totalGames: 2,
      byStatus: { WANT_TO_PLAY: 0, PLAYING: 1, COMPLETED: 1 },
      averageRating: 9,
    });

    // Delete Alice's account -> old token is rejected with 401
    const delRes = await request(app)
      .delete('/api/me')
      .set('Authorization', `Bearer ${token1}`);
    expect(delRes.status).toBe(204);

    const afterDelete = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token1}`);
    expect(afterDelete.status).toBe(401);
  });

  it('enforces rate limiting on /api/auth/* (11th request returns 429)', async () => {
    let lastStatus = 200;
    for (let i = 0; i < 12; i += 1) {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'wrongpassword',
      });
      lastStatus = res.status;
      if (lastStatus === 429) {
        break;
      }
    }
    expect(lastStatus).toBe(429);
  });
});
