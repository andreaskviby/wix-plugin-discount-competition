const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  instanceId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  type: {
    type: String,
    required: true,
    enum: ['SPIN_WHEEL', 'QUIZ', 'INSTANT_WIN', 'PHOTO_CONTEST']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  config: {
    // Spin Wheel Configuration
    segments: {
      type: Number,
      min: 3,
      max: 12
    },
    prizes: [{
      name: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping', 'custom']
      },
      value: Number,
      description: String,
      probability: {
        type: Number,
        min: 0,
        max: 1
      }
    }],
    
    // Quiz Configuration
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String
    }],
    timeLimit: Number,
    passingScore: Number,
    maxAttempts: Number,
    
    // Instant Win Configuration
    winProbability: {
      type: Number,
      min: 0,
      max: 1
    },
    maxWinsPerDay: Number,
    maxWinsTotal: Number,
    
    // Photo Contest Configuration
    votingEnabled: Boolean,
    submissionDeadline: Date,
    votingDeadline: Date,
    maxSubmissions: Number,
    
    // Common Configuration
    maxParticipationsPerUser: {
      type: Number,
      default: 1
    },
    requireEmail: {
      type: Boolean,
      default: true
    },
    ageRestriction: {
      type: Number,
      min: 13
    }
  },
  schedule: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    timezone: {
      type: String,
      default: 'UTC'
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  aiGenerated: {
    content: {
      title: String,
      description: String,
      callToAction: String,
      terms: String,
      socialShare: String
    },
    language: {
      type: String,
      default: 'en'
    },
    lastGenerated: Date
  },
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    uniqueParticipants: {
      type: Number,
      default: 0
    },
    totalPrizes: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageSessionDuration: {
      type: Number,
      default: 0
    }
  },
  branding: {
    primaryColor: String,
    secondaryColor: String,
    logo: String,
    backgroundColor: String,
    fontFamily: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
competitionSchema.index({ userId: 1, createdAt: -1 });
competitionSchema.index({ instanceId: 1, status: 1 });
competitionSchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

// Virtual for days remaining
competitionSchema.virtual('daysRemaining').get(function() {
  if (!this.schedule.endDate) return null;
  
  const now = new Date();
  const end = new Date(this.schedule.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
});

// Method to check if competition is currently active
competitionSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const start = new Date(this.schedule.startDate);
  const end = this.schedule.endDate ? new Date(this.schedule.endDate) : null;
  
  return this.schedule.isActive && 
         now >= start && 
         (!end || now <= end);
};

// Method to update stats
competitionSchema.methods.updateStats = function(newStats) {
  this.stats = { ...this.stats, ...newStats };
  return this.save();
};

// Pre-save middleware
competitionSchema.pre('save', function(next) {
  // Auto-activate competition if start date is now and status is draft
  if (this.schedule.startDate <= new Date() && this.status === 'draft') {
    this.schedule.isActive = true;
    this.status = 'active';
  }
  
  // Auto-complete competition if end date has passed
  if (this.schedule.endDate && this.schedule.endDate <= new Date() && this.status === 'active') {
    this.schedule.isActive = false;
    this.status = 'completed';
  }
  
  next();
});

module.exports = mongoose.model('Competition', competitionSchema);