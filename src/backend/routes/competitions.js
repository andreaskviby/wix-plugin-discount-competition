const express = require('express');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// In-memory store for development (replace with database in production)
const competitions = new Map();

// Competition types configuration
const COMPETITION_TYPES = {
  SPIN_WHEEL: {
    name: 'Spin to Win Wheel',
    description: 'Classic spinning wheel with customizable prizes',
    defaultConfig: {
      segments: 8,
      prizes: ['10% Off', '15% Off', '20% Off', 'Free Shipping', '5% Off', 'Try Again', '25% Off', 'Buy One Get One'],
      spinDuration: 3000,
      maxSpinsPerUser: 1
    }
  },
  QUIZ: {
    name: 'Quiz Competition',
    description: 'Interactive quiz with prize rewards',
    defaultConfig: {
      questions: [],
      timeLimit: 60,
      passingScore: 70,
      maxAttempts: 3
    }
  },
  INSTANT_WIN: {
    name: 'Instant Win Game',
    description: 'Immediate prize determination game',
    defaultConfig: {
      winProbability: 0.2,
      maxWinsPerDay: 10,
      prizes: ['10% Off', '15% Off', 'Free Shipping']
    }
  },
  PHOTO_CONTEST: {
    name: 'Photo Contest',
    description: 'User-generated content competition',
    defaultConfig: {
      votingEnabled: true,
      submissionDeadline: null,
      votingDeadline: null,
      maxSubmissions: 1
    }
  }
};

// Get all competitions for a user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const userCompetitions = Array.from(competitions.values())
      .filter(competition => competition.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      competitions: userCompetitions,
      total: userCompetitions.length
    });
  } catch (error) {
    logger.error('Error fetching competitions:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

// Get competition types
router.get('/types', (req, res) => {
  res.json({ types: COMPETITION_TYPES });
});

// Create a new competition
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, type, description, config, schedule } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    if (!COMPETITION_TYPES[type]) {
      return res.status(400).json({ error: 'Invalid competition type' });
    }

    const competitionId = uuidv4();
    const competition = {
      id: competitionId,
      userId,
      name,
      type,
      description: description || '',
      config: { ...COMPETITION_TYPES[type].defaultConfig, ...config },
      schedule: schedule || {
        startDate: new Date().toISOString(),
        endDate: null,
        isActive: true
      },
      stats: {
        totalParticipants: 0,
        totalPrizes: 0,
        conversionRate: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    competitions.set(competitionId, competition);

    logger.info(`Competition created: ${competitionId} by user ${userId}`);
    
    res.status(201).json({
      message: 'Competition created successfully',
      competition
    });
  } catch (error) {
    logger.error('Error creating competition:', error);
    res.status(500).json({ error: 'Failed to create competition' });
  }
});

// Get a specific competition
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.userId;
    const competition = competitions.get(competitionId);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ competition });
  } catch (error) {
    logger.error('Error fetching competition:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
});

// Update a competition
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.userId;
    const { name, description, config, schedule } = req.body;
    
    const competition = competitions.get(competitionId);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update competition
    const updatedCompetition = {
      ...competition,
      name: name || competition.name,
      description: description !== undefined ? description : competition.description,
      config: config ? { ...competition.config, ...config } : competition.config,
      schedule: schedule ? { ...competition.schedule, ...schedule } : competition.schedule,
      updatedAt: new Date().toISOString()
    };

    competitions.set(competitionId, updatedCompetition);

    logger.info(`Competition updated: ${competitionId} by user ${userId}`);

    res.json({
      message: 'Competition updated successfully',
      competition: updatedCompetition
    });
  } catch (error) {
    logger.error('Error updating competition:', error);
    res.status(500).json({ error: 'Failed to update competition' });
  }
});

// Delete a competition
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.userId;
    const competition = competitions.get(competitionId);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    competitions.delete(competitionId);

    logger.info(`Competition deleted: ${competitionId} by user ${userId}`);

    res.json({ message: 'Competition deleted successfully' });
  } catch (error) {
    logger.error('Error deleting competition:', error);
    res.status(500).json({ error: 'Failed to delete competition' });
  }
});

// Generate AI content for competition
router.post('/:id/generate-content', authenticateToken, (req, res) => {
  try {
    const competitionId = req.params.id;
    const userId = req.user.userId;
    const { contentType, language, brandInfo } = req.body;
    
    const competition = competitions.get(competitionId);

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    if (competition.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mock AI content generation (replace with actual AI integration)
    const mockContent = {
      title: `Win Amazing Prizes with ${competition.name}!`,
      description: `Join our exciting ${COMPETITION_TYPES[competition.type].name.toLowerCase()} and get a chance to win fantastic discounts and prizes!`,
      callToAction: 'Spin Now!',
      terms: 'Terms and conditions apply. One entry per customer. Valid while supplies last.',
      socialShare: `I just joined an amazing competition at [Store Name]! Check it out and win prizes too!`
    };

    logger.info(`AI content generated for competition: ${competitionId}`);

    res.json({
      message: 'Content generated successfully',
      content: mockContent,
      language: language || 'en',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error generating AI content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

module.exports = router;