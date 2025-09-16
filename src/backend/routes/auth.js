const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

// In-memory store for development (replace with database in production)
const users = new Map();
const sessions = new Map();

// Wix OAuth configuration
const WIX_CONFIG = {
  clientId: process.env.WIX_CLIENT_ID,
  clientSecret: process.env.WIX_CLIENT_SECRET,
  redirectUri: process.env.WIX_REDIRECT_URI || 'http://localhost:3001/api/auth/wix/callback',
  environment: process.env.WIX_ENVIRONMENT || 'development'
};

// Generate Wix OAuth URL
router.get('/wix/authorize', (req, res) => {
  try {
    const state = uuidv4();
    sessions.set(state, { timestamp: Date.now() });

    const authUrl = new URL('https://www.wix.com/installer/install');
    authUrl.searchParams.append('appId', WIX_CONFIG.clientId);
    authUrl.searchParams.append('redirectUrl', WIX_CONFIG.redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'offline_access');

    res.json({
      authUrl: authUrl.toString(),
      state
    });
  } catch (error) {
    logger.error('Error generating Wix auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
});

// Handle Wix OAuth callback
router.get('/wix/callback', async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    // Verify state parameter
    if (!sessions.has(state)) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.wix.com/oauth/access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${WIX_CONFIG.clientId}:${WIX_CONFIG.clientSecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: WIX_CONFIG.clientId,
        code,
        redirect_uri: WIX_CONFIG.redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for token');
    }

    const tokenData = await tokenResponse.json();

    // Create user session
    const userId = uuidv4();
    const user = {
      id: userId,
      wixAccessToken: tokenData.access_token,
      wixRefreshToken: tokenData.refresh_token,
      instanceId: tokenData.instance_id,
      createdAt: new Date().toISOString()
    };

    users.set(userId, user);

    // Generate JWT token
    const token = jwt.sign(
      { userId, instanceId: tokenData.instance_id },
      process.env.JWT_SECRET || 'development-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Clean up session state
    sessions.delete(state);

    res.json({
      token,
      user: {
        id: userId,
        instanceId: tokenData.instance_id
      }
    });
  } catch (error) {
    logger.error('Error handling Wix OAuth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify JWT token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development-secret');
    const user = users.get(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        instanceId: user.instanceId
      }
    });
  } catch (error) {
    logger.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  // In a real implementation, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;