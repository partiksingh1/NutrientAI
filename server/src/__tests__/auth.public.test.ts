import request from 'supertest';
import app from '../app.js';

vi.mock('../db/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    }
  }
}));

vi.mock('../langchain/redisClient.js', () => ({
  redis: {
    on: vi.fn(),
    connect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
  }
}));

describe('Auth APIs', () => {
  it('POST /api/auth/signup should validate and create user', async () => {
    const prisma = (await import('../db/prisma.js')).default as any;
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({ id: 1, email: 'a@b.com', username: 'alice', password: 'hashed', profile_completed: false });
    (prisma.user.update as any).mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: 'alice', email: 'a@b.com', password: 'secret' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('a@b.com');
  });

  it('POST /api/auth/signin should return tokens for valid creds', async () => {
    const prisma = (await import('../db/prisma.js')).default as any;
    const bcrypt = await import('bcrypt');

    (prisma.user.findUnique as any).mockResolvedValue({ id: 2, email: 'c@d.com', username: 'carl', password: await bcrypt.hash('pw', 1), profile_completed: false });
    (prisma.user.update as any).mockResolvedValue({});

    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'c@d.com', password: 'pw' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.email).toBe('c@d.com');
  });
});
