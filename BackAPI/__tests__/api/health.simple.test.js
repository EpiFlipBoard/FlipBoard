import request from 'supertest';
import app from '../../src/index.js';

describe('API Health Endpoint', () => {
  it('should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
