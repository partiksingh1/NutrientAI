import request from 'supertest';
import app from '../app.js';

describe('Health root endpoint', () => {
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Hello, TypeScript + Express');
  });
});
