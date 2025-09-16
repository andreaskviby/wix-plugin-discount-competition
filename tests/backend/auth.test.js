const request = require('supertest');
const express = require('express');

// Mock the auth route
const authRouter = require('../../src/backend/routes/auth');

describe('Auth Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  describe('GET /api/auth/wix/authorize', () => {
    it('should return authorization URL', async () => {
      const response = await request(app)
        .get('/api/auth/wix/authorize')
        .expect(200);

      expect(response.body).toHaveProperty('authUrl');
      expect(response.body).toHaveProperty('state');
      expect(response.body.authUrl).toContain('wix.com');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 when invalid token provided', async () => {
      const response = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});