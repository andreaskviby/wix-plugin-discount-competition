const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: true,
    index: true
  },
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
  participant: {
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    firstName: String,
    lastName: String,
    phone: String,
    customerId: String, // Wix customer ID if available
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  entry: {
    type: {
      type: String,
      enum: ['spin_wheel', 'quiz', 'instant_win', 'photo_contest'],
      required: true
    },
    data: {
      // Spin Wheel Results
      spinResult: {
        segment: Number,
        prize: String,
        isWinner: Boolean
      },
      
      // Quiz Results
      quizAnswers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
        timeSpent: Number
      }],
      score: Number,
      totalQuestions: Number,
      correctAnswers: Number,
      
      // Instant Win Results
      isWinner: Boolean,
      prize: String,
      
      // Photo Contest Submission
      photoUrl: String,
      caption: String,
      votes: {
        type: Number,
        default: 0
      },
      
      // Common fields
      sessionDuration: Number,
      deviceType: String,
      browserInfo: String
    }
  },
  prize: {
    awarded: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping', 'custom', 'none']
    },
    value: Number,
    description: String,
    couponCode: String,
    expirationDate: Date,
    redeemed: {
      type: Boolean,
      default: false
    },
    redeemedAt: Date,
    orderValue: Number
  },
  analytics: {
    referralSource: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    socialShare: {
      shared: {
        type: Boolean,
        default: false
      },
      platform: String,
      sharedAt: Date
    },
    followUpActions: [{
      action: String,
      timestamp: Date,
      data: mongoose.Schema.Types.Mixed
    }]
  },
  status: {
    type: String,
    enum: ['completed', 'abandoned', 'disqualified'],
    default: 'completed'
  },
  fraudCheck: {
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    flags: [String],
    verified: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
participationSchema.index({ competitionId: 1, createdAt: -1 });
participationSchema.index({ userId: 1, competitionId: 1 });
participationSchema.index({ 'participant.email': 1, competitionId: 1 });
participationSchema.index({ instanceId: 1, createdAt: -1 });
participationSchema.index({ 'prize.awarded': 1, 'prize.redeemed': 1 });

// Virtual for participant full name
participationSchema.virtual('participantName').get(function() {
  if (this.participant.firstName && this.participant.lastName) {
    return `${this.participant.firstName} ${this.participant.lastName}`;
  }
  return this.participant.firstName || this.participant.lastName || this.participant.email;
});

// Virtual for conversion value
participationSchema.virtual('conversionValue').get(function() {
  if (this.prize.redeemed && this.prize.orderValue) {
    return this.prize.orderValue;
  }
  return 0;
});

// Method to award prize
participationSchema.methods.awardPrize = async function(prizeData) {
  this.prize = {
    ...this.prize,
    ...prizeData,
    awarded: true
  };
  
  // Generate coupon code if needed
  if (prizeData.type !== 'none' && !prizeData.couponCode) {
    this.prize.couponCode = this.generateCouponCode();
  }
  
  return this.save();
};

// Method to mark prize as redeemed
participationSchema.methods.redeemPrize = async function(orderValue) {
  this.prize.redeemed = true;
  this.prize.redeemedAt = new Date();
  if (orderValue) {
    this.prize.orderValue = orderValue;
  }
  
  return this.save();
};

// Method to generate unique coupon code
participationSchema.methods.generateCouponCode = function() {
  const prefix = 'COMP';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Method to add analytics event
participationSchema.methods.addAnalyticsEvent = function(action, data = {}) {
  this.analytics.followUpActions.push({
    action,
    timestamp: new Date(),
    data
  });
  
  return this.save();
};

// Static method to get participation stats for a competition
participationSchema.statics.getCompetitionStats = async function(competitionId) {
  const stats = await this.aggregate([
    { $match: { competitionId: mongoose.Types.ObjectId(competitionId) } },
    {
      $group: {
        _id: null,
        totalParticipants: { $sum: 1 },
        uniqueParticipants: { $addToSet: '$participant.email' },
        totalPrizes: { $sum: { $cond: ['$prize.awarded', 1, 0] } },
        totalRedemptions: { $sum: { $cond: ['$prize.redeemed', 1, 0] } },
        totalRevenue: { $sum: '$prize.orderValue' },
        avgSessionDuration: { $avg: '$entry.data.sessionDuration' }
      }
    },
    {
      $project: {
        totalParticipants: 1,
        uniqueParticipants: { $size: '$uniqueParticipants' },
        totalPrizes: 1,
        totalRedemptions: 1,
        conversionRate: {
          $multiply: [
            { $divide: ['$totalRedemptions', '$totalParticipants'] },
            100
          ]
        },
        totalRevenue: { $ifNull: ['$totalRevenue', 0] },
        avgSessionDuration: { $round: ['$avgSessionDuration', 0] }
      }
    }
  ]);
  
  return stats[0] || {
    totalParticipants: 0,
    uniqueParticipants: 0,
    totalPrizes: 0,
    totalRedemptions: 0,
    conversionRate: 0,
    totalRevenue: 0,
    avgSessionDuration: 0
  };
};

module.exports = mongoose.model('Participation', participationSchema);