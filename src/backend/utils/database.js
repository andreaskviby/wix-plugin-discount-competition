const mongoose = require('mongoose');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class Database {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const mongoUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/wix_discount_competition';
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferMaxEntries: 0,
        retryWrites: true,
        w: 'majority'
      };

      if (process.env.NODE_ENV === 'production') {
        // Production-specific options
        options.ssl = true;
        options.authSource = 'admin';
      }

      this.connection = await mongoose.connect(mongoUrl, options);
      this.isConnected = true;
      
      logger.info('Connected to MongoDB successfully');
      
      // Set up connection event listeners
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', () => {
        this.disconnect();
      });

      return this.connection;
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        this.isConnected = false;
        logger.info('Disconnected from MongoDB');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnectedToDatabase() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  async healthCheck() {
    try {
      if (!this.isConnectedToDatabase()) {
        throw new Error('Not connected to database');
      }

      // Simple ping to check connection
      await mongoose.connection.db.admin().ping();
      
      return {
        status: 'healthy',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        readyState: mongoose.connection.readyState
      };
    }
  }

  // Method to create indexes for better performance
  async createIndexes() {
    try {
      const User = require('./models/User');
      const Competition = require('./models/Competition');
      const Participation = require('./models/Participation');

      // Create indexes defined in models
      await User.createIndexes();
      await Competition.createIndexes();
      await Participation.createIndexes();

      logger.info('Database indexes created successfully');
    } catch (error) {
      logger.error('Failed to create database indexes:', error);
      throw error;
    }
  }

  // Method to seed initial data (for development)
  async seedData() {
    try {
      if (process.env.NODE_ENV === 'production') {
        logger.warn('Skipping data seeding in production');
        return;
      }

      const Competition = require('./models/Competition');
      const competitionCount = await Competition.countDocuments();

      if (competitionCount === 0) {
        // Create sample competitions for development
        const sampleCompetitions = [
          {
            userId: 'dev-user-1',
            instanceId: 'dev-instance-1',
            name: 'Summer Sale Spin Wheel',
            description: 'Spin to win amazing summer discounts!',
            type: 'SPIN_WHEEL',
            status: 'active',
            config: {
              segments: 8,
              prizes: [
                { name: '10% Off', type: 'percentage', value: 10, probability: 0.3 },
                { name: '15% Off', type: 'percentage', value: 15, probability: 0.2 },
                { name: '20% Off', type: 'percentage', value: 20, probability: 0.15 },
                { name: 'Free Shipping', type: 'free_shipping', value: 0, probability: 0.2 },
                { name: 'Try Again', type: 'custom', value: 0, probability: 0.15 }
              ]
            },
            schedule: {
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              isActive: true
            }
          }
        ];

        await Competition.insertMany(sampleCompetitions);
        logger.info('Sample data seeded successfully');
      }
    } catch (error) {
      logger.error('Failed to seed data:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;