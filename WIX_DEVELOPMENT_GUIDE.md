# Wix App Development Guide

## Wix Platform Overview

### Wix Ecosystem Components
1. **Wix Editor**: Visual website builder
2. **Wix ADI**: Artificial Design Intelligence
3. **Wix Code (Velo)**: Full-stack development platform
4. **Wix Stores**: eCommerce solution
5. **Wix Bookings**: Appointment scheduling
6. **Wix Events**: Event management
7. **Wix Hotels**: Hospitality management
8. **Wix Restaurants**: Restaurant management

### Wix App Types
1. **Dashboard Apps**: Run in Wix business dashboard
2. **Site Apps**: Embedded in user websites
3. **Hybrid Apps**: Combination of dashboard and site
4. **Headless Apps**: Backend services only

## Wix App Architecture

### App Structure
```
wix-discount-competition/
├── src/
│   ├── dashboard/           # Business dashboard interface
│   ├── public/              # Site widget (if applicable)
│   ├── backend/             # Server-side logic
│   └── shared/              # Shared utilities
├── config/
│   ├── app-config.json      # Wix app configuration
│   ├── permissions.json     # Required permissions
│   └── webhooks.json        # Webhook configurations
├── assets/
│   ├── icons/               # App icons (various sizes)
│   ├── screenshots/         # App store screenshots
│   └── media/               # Marketing materials
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### Key Configuration Files

#### app-config.json
```json
{
  "appId": "discount-competition-app",
  "appName": "Discount Competition Master",
  "version": "1.0.0",
  "description": "AI-powered discount competitions for Wix stores",
  "category": "eCommerce",
  "permissions": [
    "MANAGE_STORE",
    "MANAGE_ORDERS",
    "MANAGE_COUPONS",
    "READ_CONTACTS",
    "MANAGE_MARKETING"
  ],
  "webhooks": [
    {
      "eventType": "ORDER_PAID",
      "endpoint": "/webhooks/order-paid"
    },
    {
      "eventType": "COUPON_USED",
      "endpoint": "/webhooks/coupon-used"
    }
  ],
  "dashboard": {
    "pages": [
      {
        "name": "Dashboard",
        "route": "/dashboard",
        "component": "Dashboard"
      },
      {
        "name": "Competitions",
        "route": "/competitions",
        "component": "CompetitionManager"
      },
      {
        "name": "Analytics",
        "route": "/analytics",
        "component": "Analytics"
      },
      {
        "name": "Settings",
        "route": "/settings",
        "component": "Settings"
      }
    ]
  }
}
```

## Wix Development Standards

### Design System Integration
```jsx
// Use Wix Design System components
import {
  Page,
  Card,
  Button,
  Input,
  Table,
  Modal,
  Layout,
  Cell,
  Text,
  Box
} from '@wix/design-system';

// Example component following Wix patterns
const CompetitionCard = ({ competition, onEdit, onDelete }) => {
  return (
    <Card>
      <Card.Header title={competition.name} />
      <Card.Content>
        <Layout>
          <Cell span={8}>
            <Text>{competition.description}</Text>
          </Cell>
          <Cell span={4}>
            <Box align="right">
              <Button size="small" onClick={() => onEdit(competition.id)}>
                Edit
              </Button>
              <Button 
                size="small" 
                skin="destructive" 
                onClick={() => onDelete(competition.id)}
              >
                Delete
              </Button>
            </Box>
          </Cell>
        </Layout>
      </Card.Content>
    </Card>
  );
};
```

### API Integration Patterns
```javascript
// Wix Stores API integration
import { store } from '@wix/stores';
import { coupons } from '@wix/marketing';
import { members } from '@wix/members';

class WixIntegrationService {
  async createDiscountCoupon(couponData) {
    try {
      const coupon = await coupons.createCoupon({
        name: couponData.name,
        code: couponData.code,
        type: 'PERCENT',
        value: couponData.discountPercentage,
        usageLimit: couponData.usageLimit,
        expiration: {
          type: 'DATE',
          date: couponData.expirationDate
        },
        scope: {
          namespace: 'STORES'
        }
      });
      
      return coupon;
    } catch (error) {
      console.error('Failed to create coupon:', error);
      throw new Error('Coupon creation failed');
    }
  }

  async getStoreProducts(options = {}) {
    try {
      const products = await store.queryProducts()
        .limit(options.limit || 50)
        .skip(options.skip || 0)
        .find();
      
      return products;
    } catch (error) {
      console.error('Failed to fetch products:', error);
      throw new Error('Product fetch failed');
    }
  }

  async getCustomerData(customerId) {
    try {
      const member = await members.getMember(customerId);
      return member;
    } catch (error) {
      console.error('Failed to fetch customer data:', error);
      throw new Error('Customer data fetch failed');
    }
  }
}
```

## Authentication and Security

### OAuth 2.0 Implementation
```javascript
// OAuth configuration
const oauthConfig = {
  clientId: process.env.WIX_CLIENT_ID,
  clientSecret: process.env.WIX_CLIENT_SECRET,
  redirectUri: process.env.WIX_REDIRECT_URI,
  scope: [
    'offline_access',
    'stores.read',
    'stores.write',
    'marketing.read',
    'marketing.write',
    'contacts.read'
  ]
};

// Authentication middleware
const authenticateWixUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.WIX_APP_SECRET);
    req.user = decoded;
    req.instanceId = decoded.instanceId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid authentication token' });
  }
};
```

### Permission Management
```javascript
// Check required permissions
const checkPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = requiredPermissions.every(
      permission => userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: requiredPermissions,
        current: userPermissions
      });
    }

    next();
  };
};

// Usage
app.post('/api/competitions', 
  authenticateWixUser,
  checkPermissions(['MANAGE_STORE', 'MANAGE_MARKETING']),
  createCompetition
);
```

## Data Management

### Wix Data Collections
```javascript
// Define data collections
const collections = {
  competitions: 'Competitions',
  participants: 'CompetitionParticipants', 
  analytics: 'CompetitionAnalytics',
  settings: 'AppSettings'
};

// Data service implementation
import { wixData } from 'wix-data';

class WixDataService {
  async saveCompetition(competition) {
    try {
      const result = await wixData.save(collections.competitions, competition);
      return result;
    } catch (error) {
      console.error('Failed to save competition:', error);
      throw error;
    }
  }

  async getCompetitions(filters = {}) {
    try {
      let query = wixData.query(collections.competitions);
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.startDate) {
        query = query.ge('startDate', filters.startDate);
      }

      const results = await query
        .ascending('createdDate')
        .find();
        
      return results;
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
      throw error;
    }
  }

  async recordParticipation(participationData) {
    try {
      const result = await wixData.save(collections.participants, {
        ...participationData,
        timestamp: new Date()
      });
      return result;
    } catch (error) {
      console.error('Failed to record participation:', error);
      throw error;
    }
  }
}
```

### Database Schema Design
```javascript
// Competition schema
const competitionSchema = {
  _id: 'string',
  name: 'string',
  description: 'string',
  type: 'string', // 'spin_wheel', 'quiz', 'instant_win'
  status: 'string', // 'draft', 'active', 'completed', 'paused'
  startDate: 'datetime',
  endDate: 'datetime',
  prizes: {
    type: 'array',
    items: {
      name: 'string',
      type: 'string', // 'discount', 'product', 'cash'
      value: 'number',
      probability: 'number'
    }
  },
  rules: {
    maxParticipations: 'number',
    eligibility: 'string',
    requirements: 'array'
  },
  settings: {
    aiGenerated: 'boolean',
    language: 'string',
    branding: 'object'
  },
  analytics: {
    participants: 'number',
    conversions: 'number',
    revenue: 'number'
  },
  createdDate: 'datetime',
  modifiedDate: 'datetime'
};
```

## Webhooks and Real-time Updates

### Webhook Handlers
```javascript
// Webhook endpoint handlers
const webhookHandlers = {
  async orderPaid(req, res) {
    try {
      const { orderId, customerId, total, items } = req.body;
      
      // Check if customer is competition participant
      const participation = await WixDataService.getParticipation({
        customerId,
        status: 'active'
      });

      if (participation) {
        // Track conversion
        await AnalyticsService.trackConversion({
          competitionId: participation.competitionId,
          customerId,
          orderId,
          value: total
        });

        // Update competition analytics
        await updateCompetitionMetrics(participation.competitionId);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  },

  async couponUsed(req, res) {
    try {
      const { couponId, customerId, orderId, discountAmount } = req.body;
      
      // Find related competition
      const competition = await findCompetitionByCoupon(couponId);
      
      if (competition) {
        await AnalyticsService.trackCouponUsage({
          competitionId: competition._id,
          couponId,
          customerId,
          orderId,
          discountAmount
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Coupon webhook error:', error);
      res.status(500).json({ error: 'Coupon webhook failed' });
    }
  }
};
```

## Performance Optimization

### Caching Strategy
```javascript
// Redis caching for frequently accessed data
import Redis from 'redis';
const redis = Redis.createClient(process.env.REDIS_URL);

class CacheService {
  async getActiveCompetitions(instanceId) {
    const cacheKey = `competitions:active:${instanceId}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const competitions = await WixDataService.getCompetitions({
      status: 'active'
    });

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(competitions));
    
    return competitions;
  }

  async invalidateCompetitionCache(instanceId, competitionId) {
    const keys = [
      `competitions:active:${instanceId}`,
      `competition:${competitionId}`,
      `analytics:${competitionId}`
    ];

    await Promise.all(keys.map(key => redis.del(key)));
  }
}
```

### API Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

// Different limits for different endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

const competitionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit competition creation
  keyGenerator: (req) => req.user.instanceId
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/competitions', competitionLimiter);
```

## Testing Strategy

### Wix-Specific Testing
```javascript
// Mock Wix services for testing
jest.mock('@wix/stores', () => ({
  store: {
    queryProducts: jest.fn(() => ({
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      find: jest.fn()
    }))
  }
}));

// Integration test example
describe('Wix Integration', () => {
  test('should create coupon successfully', async () => {
    const mockCoupon = {
      id: 'test-coupon-id',
      code: 'TEST10',
      value: 10
    };

    coupons.createCoupon.mockResolvedValue(mockCoupon);

    const service = new WixIntegrationService();
    const result = await service.createDiscountCoupon({
      name: 'Test Coupon',
      code: 'TEST10',
      discountPercentage: 10,
      usageLimit: 100,
      expirationDate: new Date()
    });

    expect(result).toEqual(mockCoupon);
    expect(coupons.createCoupon).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'TEST10',
        value: 10
      })
    );
  });
});
```

## Deployment and CI/CD

### Wix App Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to Wix

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build app
        run: npm run build
        
      - name: Deploy to Wix
        run: |
          npx wix deploy
        env:
          WIX_API_KEY: ${{ secrets.WIX_API_KEY }}
          WIX_APP_ID: ${{ secrets.WIX_APP_ID }}
```

## Monitoring and Analytics

### App Performance Monitoring
```javascript
// Custom analytics for Wix apps
class AppAnalytics {
  static track(event, properties = {}) {
    // Send to Wix Analytics
    if (typeof wix !== 'undefined' && wix.analytics) {
      wix.analytics.track(event, {
        ...properties,
        appId: 'discount-competition-app',
        timestamp: new Date().toISOString()
      });
    }

    // Send to custom analytics service
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, properties })
    }).catch(console.error);
  }

  static trackCompetitionCreated(competitionData) {
    this.track('competition_created', {
      type: competitionData.type,
      aiGenerated: competitionData.aiGenerated,
      prizeCount: competitionData.prizes.length
    });
  }

  static trackParticipation(participationData) {
    this.track('competition_participation', {
      competitionId: participationData.competitionId,
      source: participationData.source
    });
  }
}
```

This Wix development guide provides the foundation for building a professional, scalable discount competition app that follows Wix best practices and integrates seamlessly with the Wix ecosystem.