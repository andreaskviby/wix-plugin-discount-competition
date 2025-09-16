const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class WixAPIService {
  constructor() {
    this.baseURL = 'https://www.wixapis.com';
    this.apiVersion = 'v1';
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
  }

  // Create axios instance with authentication
  createClient(accessToken, instanceId) {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'wix-instance-id': instanceId,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  // Get store information
  async getStoreInfo(accessToken, instanceId) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const response = await client.get('/stores/v1/info');
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to get store info:', error.message);
      return this.handleError(error);
    }
  }

  // Get store products
  async getProducts(accessToken, instanceId, options = {}) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const params = {
        limit: options.limit || 50,
        offset: options.offset || 0,
        includeVariants: true,
        ...options.filters
      };

      const response = await client.get('/stores/v1/products/query', { params });
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data,
        pagination: {
          limit: params.limit,
          offset: params.offset,
          total: response.data.metadata?.count || 0
        }
      };
    } catch (error) {
      logger.error('Failed to get products:', error.message);
      return this.handleError(error);
    }
  }

  // Get store customers
  async getCustomers(accessToken, instanceId, options = {}) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const params = {
        limit: options.limit || 50,
        offset: options.offset || 0,
        ...options.filters
      };

      const response = await client.get('/members/v1/members/query', { params });
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data,
        pagination: {
          limit: params.limit,
          offset: params.offset,
          total: response.data.metadata?.count || 0
        }
      };
    } catch (error) {
      logger.error('Failed to get customers:', error.message);
      return this.handleError(error);
    }
  }

  // Get store orders
  async getOrders(accessToken, instanceId, options = {}) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const params = {
        limit: options.limit || 50,
        offset: options.offset || 0,
        ...options.filters
      };

      const response = await client.get('/stores/v1/orders/query', { params });
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data,
        pagination: {
          limit: params.limit,
          offset: params.offset,
          total: response.data.metadata?.count || 0
        }
      };
    } catch (error) {
      logger.error('Failed to get orders:', error.message);
      return this.handleError(error);
    }
  }

  // Create discount coupon
  async createCoupon(accessToken, instanceId, couponData) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const payload = {
        name: couponData.name,
        code: couponData.code || this.generateCouponCode(),
        type: couponData.type || 'PERCENT',
        value: couponData.value,
        expirationDate: couponData.expirationDate,
        usageLimit: couponData.usageLimit || 100,
        minimumOrderValue: couponData.minimumOrderValue || 0,
        limitPerCustomer: couponData.limitPerCustomer || 1,
        active: true
      };

      const response = await client.post('/stores/v1/coupons', payload);
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to create coupon:', error.message);
      return this.handleError(error);
    }
  }

  // Update coupon
  async updateCoupon(accessToken, instanceId, couponId, updateData) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const response = await client.patch(`/stores/v1/coupons/${couponId}`, updateData);
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to update coupon:', error.message);
      return this.handleError(error);
    }
  }

  // Delete coupon
  async deleteCoupon(accessToken, instanceId, couponId) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      await client.delete(`/stores/v1/coupons/${couponId}`);
      
      return {
        success: true,
        message: 'Coupon deleted successfully'
      };
    } catch (error) {
      logger.error('Failed to delete coupon:', error.message);
      return this.handleError(error);
    }
  }

  // Get analytics data
  async getAnalytics(accessToken, instanceId, options = {}) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const params = {
        timeRange: options.timeRange || '7d',
        metrics: options.metrics || ['revenue', 'orders', 'visitors'],
        ...options.filters
      };

      const response = await client.get('/analytics/v1/reports', { params });
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to get analytics:', error.message);
      return this.handleError(error);
    }
  }

  // Send notification to store owner
  async sendNotification(accessToken, instanceId, notification) {
    try {
      const client = this.createClient(accessToken, instanceId);
      
      const payload = {
        type: notification.type || 'info',
        title: notification.title,
        message: notification.message,
        data: notification.data || {}
      };

      const response = await client.post('/notifications/v1/send', payload);
      
      this.updateRateLimitInfo(response.headers);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to send notification:', error.message);
      return this.handleError(error);
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const client = axios.create({
        baseURL: 'https://www.wix.com',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const payload = {
        grant_type: 'refresh_token',
        client_id: process.env.WIX_CLIENT_ID,
        client_secret: process.env.WIX_CLIENT_SECRET,
        refresh_token: refreshToken
      };

      const response = await client.post('/oauth/access', payload);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      logger.error('Failed to refresh access token:', error.message);
      return this.handleError(error);
    }
  }

  // Validate webhook signature
  validateWebhookSignature(payload, signature, secret) {
    const crypto = require('crypto');
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return `sha256=${expectedSignature}` === signature;
  }

  // Generate unique coupon code
  generateCouponCode(prefix = 'COMP') {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle rate limiting
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        return {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: parseInt(retryAfter) || 60,
          code: 'RATE_LIMIT_EXCEEDED'
        };
      }
      
      // Handle authentication errors
      if (status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          code: 'AUTHENTICATION_FAILED'
        };
      }
      
      // Handle authorization errors
      if (status === 403) {
        return {
          success: false,
          error: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS'
        };
      }
      
      // Handle not found errors
      if (status === 404) {
        return {
          success: false,
          error: 'Resource not found',
          code: 'NOT_FOUND'
        };
      }
      
      return {
        success: false,
        error: data.message || 'API request failed',
        code: data.code || 'API_ERROR',
        details: data
      };
    }
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'Network error - unable to connect to Wix API',
        code: 'NETWORK_ERROR'
      };
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        error: 'Request timeout',
        code: 'TIMEOUT'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }

  // Update rate limit information from response headers
  updateRateLimitInfo(headers) {
    this.rateLimitRemaining = parseInt(headers['x-ratelimit-remaining']) || null;
    this.rateLimitReset = parseInt(headers['x-ratelimit-reset']) || null;
  }

  // Get current rate limit status
  getRateLimitStatus() {
    return {
      remaining: this.rateLimitRemaining,
      reset: this.rateLimitReset,
      resetTime: this.rateLimitReset ? new Date(this.rateLimitReset * 1000) : null
    };
  }

  // Check if we're approaching rate limits
  isApproachingRateLimit() {
    return this.rateLimitRemaining !== null && this.rateLimitRemaining < 10;
  }
}

// Create singleton instance
const wixAPIService = new WixAPIService();

module.exports = wixAPIService;