const express = require('express');
const winston = require('winston');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// Mock analytics data (replace with actual database queries)
const generateMockAnalytics = (userId, timeRange = '7d') => {
  const now = new Date();
  const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
  
  const data = {
    overview: {
      totalCompetitions: Math.floor(Math.random() * 10) + 5,
      totalParticipants: Math.floor(Math.random() * 500) + 100,
      totalPrizesAwarded: Math.floor(Math.random() * 50) + 20,
      conversionRate: (Math.random() * 15 + 10).toFixed(2) + '%',
      averageOrderValue: '$' + (Math.random() * 50 + 75).toFixed(2),
      totalRevenue: '$' + (Math.random() * 5000 + 2000).toFixed(2)
    },
    trends: {
      participantsTrend: Array.from({ length: daysBack }, (_, i) => ({
        date: new Date(now.getTime() - (daysBack - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        participants: Math.floor(Math.random() * 50) + 10,
        conversions: Math.floor(Math.random() * 20) + 5
      })),
      revenueTrend: Array.from({ length: daysBack }, (_, i) => ({
        date: new Date(now.getTime() - (daysBack - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 500) + 200
      }))
    },
    competitionPerformance: [
      {
        id: '1',
        name: 'Summer Spin Wheel',
        type: 'SPIN_WHEEL',
        participants: 145,
        conversions: 23,
        revenue: 1250.00,
        conversionRate: '15.9%'
      },
      {
        id: '2',
        name: 'Product Knowledge Quiz',
        type: 'QUIZ',
        participants: 89,
        conversions: 31,
        revenue: 890.50,
        conversionRate: '34.8%'
      },
      {
        id: '3',
        name: 'Instant Win Friday',
        type: 'INSTANT_WIN',
        participants: 203,
        conversions: 41,
        revenue: 2150.75,
        conversionRate: '20.2%'
      }
    ],
    topPrizes: [
      { name: '20% Off Everything', claimed: 45, revenue: 1250.00 },
      { name: 'Free Shipping', claimed: 67, revenue: 890.50 },
      { name: '15% Off First Order', claimed: 32, revenue: 675.25 },
      { name: 'Buy One Get One 50% Off', claimed: 28, revenue: 1420.00 }
    ],
    demographics: {
      ageGroups: [
        { group: '18-24', percentage: 22 },
        { group: '25-34', percentage: 35 },
        { group: '35-44', percentage: 28 },
        { group: '45-54', percentage: 12 },
        { group: '55+', percentage: 3 }
      ],
      deviceTypes: [
        { type: 'Mobile', percentage: 68 },
        { type: 'Desktop', percentage: 27 },
        { type: 'Tablet', percentage: 5 }
      ],
      topCountries: [
        { country: 'United States', percentage: 45 },
        { country: 'Canada', percentage: 18 },
        { country: 'United Kingdom', percentage: 12 },
        { country: 'Australia', percentage: 8 },
        { country: 'Germany', percentage: 7 },
        { country: 'Other', percentage: 10 }
      ]
    }
  };

  return data;
};

// Get analytics overview
router.get('/overview', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { timeRange = '7d' } = req.query;
    
    const analytics = generateMockAnalytics(userId, timeRange);
    
    res.json({
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analytics.overview
    });
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
});

// Get detailed analytics
router.get('/detailed', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { timeRange = '7d' } = req.query;
    
    const analytics = generateMockAnalytics(userId, timeRange);
    
    res.json({
      timeRange,
      generatedAt: new Date().toISOString(),
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching detailed analytics:', error);
    res.status(500).json({ error: 'Failed to fetch detailed analytics' });
  }
});

// Get competition-specific analytics
router.get('/competition/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const competitionId = req.params.id;
    const { timeRange = '7d' } = req.query;
    
    // Mock competition-specific analytics
    const competitionAnalytics = {
      competitionId,
      overview: {
        totalParticipants: Math.floor(Math.random() * 200) + 50,
        uniqueParticipants: Math.floor(Math.random() * 180) + 40,
        conversions: Math.floor(Math.random() * 30) + 10,
        conversionRate: (Math.random() * 20 + 15).toFixed(2) + '%',
        revenue: '$' + (Math.random() * 2000 + 500).toFixed(2),
        averageSessionDuration: Math.floor(Math.random() * 120 + 60) + 's'
      },
      hourlyActivity: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        participants: Math.floor(Math.random() * 20) + 5
      })),
      prizeDistribution: [
        { prize: '10% Off', count: Math.floor(Math.random() * 15) + 5 },
        { prize: '15% Off', count: Math.floor(Math.random() * 12) + 3 },
        { prize: '20% Off', count: Math.floor(Math.random() * 8) + 2 },
        { prize: 'Free Shipping', count: Math.floor(Math.random() * 10) + 4 },
        { prize: 'Try Again', count: Math.floor(Math.random() * 25) + 10 }
      ],
      conversionFunnel: [
        { stage: 'Viewed Competition', count: 250, percentage: 100 },
        { stage: 'Started Competition', count: 180, percentage: 72 },
        { stage: 'Completed Competition', count: 145, percentage: 58 },
        { stage: 'Won Prize', count: 45, percentage: 18 },
        { stage: 'Redeemed Prize', count: 38, percentage: 15.2 }
      ]
    };
    
    res.json({
      timeRange,
      generatedAt: new Date().toISOString(),
      data: competitionAnalytics
    });
  } catch (error) {
    logger.error('Error fetching competition analytics:', error);
    res.status(500).json({ error: 'Failed to fetch competition analytics' });
  }
});

// Export analytics data
router.get('/export', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    const { format = 'json', timeRange = '30d' } = req.query;
    
    const analytics = generateMockAnalytics(userId, timeRange);
    
    if (format === 'csv') {
      // Convert to CSV format
      let csv = 'Date,Participants,Conversions,Revenue\n';
      analytics.trends.participantsTrend.forEach((day, index) => {
        const revenue = analytics.trends.revenueTrend[index]?.revenue || 0;
        csv += `${day.date},${day.participants},${day.conversions},${revenue}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${timeRange}-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${timeRange}-${Date.now()}.json"`);
      res.json({
        exportedAt: new Date().toISOString(),
        timeRange,
        userId,
        data: analytics
      });
    }
  } catch (error) {
    logger.error('Error exporting analytics:', error);
    res.status(500).json({ error: 'Failed to export analytics' });
  }
});

// Get real-time metrics
router.get('/realtime', authenticateToken, (req, res) => {
  try {
    const userId = req.user.userId;
    
    const realtimeMetrics = {
      activeCompetitions: Math.floor(Math.random() * 5) + 2,
      activeParticipants: Math.floor(Math.random() * 50) + 10,
      prizesAwardedToday: Math.floor(Math.random() * 20) + 5,
      revenueToday: '$' + (Math.random() * 500 + 100).toFixed(2),
      lastActivity: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
      topPerformingCompetition: {
        name: 'Weekend Spin Wheel',
        participants: Math.floor(Math.random() * 30) + 15
      }
    };
    
    res.json({
      timestamp: new Date().toISOString(),
      data: realtimeMetrics
    });
  } catch (error) {
    logger.error('Error fetching real-time metrics:', error);
    res.status(500).json({ error: 'Failed to fetch real-time metrics' });
  }
});

module.exports = router;