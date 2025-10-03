import request from 'supertest';
import app from '../app.js';
import jwt from 'jsonwebtoken';

vi.mock('../db/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    }
  }
}));

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

function tokenFor(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
}

describe('Protected user endpoints should require auth', () => {
  it('GET /api/user/profile without token returns 401', async () => {
    const res = await request(app).get('/api/user/profile');
    expect(res.status).toBe(401);
  });

  it('GET /api/user/profile with token returns user profile', async () => {
    const prisma = (await import('../db/prisma.js')).default as any;
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 42,
      email: 'x@y.com',
      username: 'x',
      password: 'redacted',
      preferences: null,
      dietaryGoals: [],
    });

    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${tokenFor(42)}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.id).toBe(42);
  });
});
