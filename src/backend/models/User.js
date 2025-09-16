const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  wixUserId: {
    type: String,
    unique: true,
    sparse: true
  },
  instanceId: {
    type: String,
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  store: {
    name: String,
    description: String,
    url: String,
    currency: {
      type: String,
      default: 'USD'
    },
    locale: String,
    industry: String
  },
  wixTokens: {
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: String,
    expiresAt: Date,
    scope: [String]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'starter', 'professional', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'trialing'],
      default: 'active'
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      competitionUpdates: {
        type: Boolean,
        default: true
      },
      weeklyReports: {
        type: Boolean,
        default: true
      }
    },
    defaults: {
      competitionType: {
        type: String,
        default: 'SPIN_WHEEL'
      },
      language: {
        type: String,
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  usage: {
    competitionsCreated: {
      type: Number,
      default: 0
    },
    totalParticipants: {
      type: Number,
      default: 0
    },
    aiContentGenerated: {
      type: Number,
      default: 0
    },
    lastActivityAt: Date
  },
  onboarding: {
    completed: {
      type: Boolean,
      default: false
    },
    completedSteps: [{
      step: String,
      completedAt: Date
    }],
    currentStep: String
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Don't return sensitive data
      delete ret.wixTokens;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ instanceId: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile.firstName || this.profile.lastName || this.email;
});

// Method to check if user can create competitions
userSchema.methods.canCreateCompetitions = function() {
  const limits = {
    free: 2,
    starter: 10,
    professional: 50,
    enterprise: Infinity
  };
  
  return this.usage.competitionsCreated < limits[this.subscription.plan];
};

// Method to check if user can use AI features
userSchema.methods.canUseAI = function() {
  const aiPlans = ['starter', 'professional', 'enterprise'];
  return aiPlans.includes(this.subscription.plan);
};

// Method to update usage stats
userSchema.methods.updateUsage = function(updates) {
  this.usage = { ...this.usage, ...updates };
  this.usage.lastActivityAt = new Date();
  return this.save();
};

// Method to complete onboarding step
userSchema.methods.completeOnboardingStep = function(step) {
  if (!this.onboarding.completedSteps.find(s => s.step === step)) {
    this.onboarding.completedSteps.push({
      step,
      completedAt: new Date()
    });
  }
  
  // Define onboarding flow
  const onboardingSteps = [
    'connect_store',
    'create_first_competition',
    'customize_branding',
    'view_analytics'
  ];
  
  const currentIndex = onboardingSteps.indexOf(step);
  if (currentIndex !== -1 && currentIndex < onboardingSteps.length - 1) {
    this.onboarding.currentStep = onboardingSteps[currentIndex + 1];
  } else {
    this.onboarding.completed = true;
    this.onboarding.currentStep = null;
  }
  
  return this.save();
};

// Pre-save middleware to update refresh token expiration
userSchema.pre('save', function(next) {
  if (this.isModified('wixTokens.accessToken')) {
    // Set token expiration to 1 hour from now (typical for Wix tokens)
    this.wixTokens.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);