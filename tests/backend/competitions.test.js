const request = require('supertest');
const express = require('express');
const competitionsRouter = require('../../src/backend/routes/competitions');

// Mock the auth middleware
jest.mock('../../src/backend/middleware/auth', () => {
  return (req, res, next) => {
    req.user = { userId: 'test-user-1', instanceId: 'test-instance-1' };
    next();
  };
});

describe('Competitions Routes', () => {
  let app;
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/competitions', competitionsRouter);
  });

  describe('GET /api/competitions', () => {
    it('should return empty competitions list for new user', async () => {
      const response = await request(app)
        .get('/api/competitions')
        .expect(200);

      expect(response.body).toHaveProperty('competitions');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.competitions)).toBe(true);
    });
  });

  describe('GET /api/competitions/types', () => {
    it('should return competition types', async () => {
      const response = await request(app)
        .get('/api/competitions/types')
        .expect(200);

      expect(response.body).toHaveProperty('types');
      expect(response.body.types).toHaveProperty('SPIN_WHEEL');
      expect(response.body.types).toHaveProperty('QUIZ');
      expect(response.body.types).toHaveProperty('INSTANT_WIN');
      expect(response.body.types).toHaveProperty('PHOTO_CONTEST');
    });
  });

  describe('POST /api/competitions', () => {
    it('should create a new competition', async () => {
      const competitionData = {
        name: 'Test Competition',
        type: 'SPIN_WHEEL',
        description: 'A test competition'
      };

      const response = await request(app)
        .post('/api/competitions')
        .send(competitionData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Competition created successfully');
      expect(response.body).toHaveProperty('competition');
      expect(response.body.competition.name).toBe(competitionData.name);
      expect(response.body.competition.type).toBe(competitionData.type);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/competitions')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid competition type', async () => {
      const competitionData = {
        name: 'Test Competition',
        type: 'INVALID_TYPE'
      };

      const response = await request(app)
        .post('/api/competitions')
        .send(competitionData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Invalid competition type');
    });
  });
});