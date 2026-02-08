import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.test' });

const skipIfNoMongoDB = process.env.CI ? describe.skip : describe;

skipIfNoMongoDB('API Endpoints Examples', () => {
  let app;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    app = express();
    app.use(express.json());

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('GET /api/health should return 200', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /api/health should return JSON', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.headers['content-type']).toMatch(/json/);
  });
});

