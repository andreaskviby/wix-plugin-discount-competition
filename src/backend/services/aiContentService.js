const OpenAI = require('openai');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

class AIContentService {
  constructor() {
    this.openai = null;
    this.anthropic = null;
    this.initialized = false;
    this.usage = {
      openai: 0,
      anthropic: 0
    };
  }

  async initialize() {
    try {
      // Initialize OpenAI
      if (process.env.OPENAI_API_KEY) {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        logger.info('OpenAI service initialized');
      }

      // Initialize Anthropic (placeholder - actual SDK integration would go here)
      if (process.env.ANTHROPIC_API_KEY) {
        // this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        logger.info('Anthropic service would be initialized here');
      }

      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize AI services:', error);
      throw error;
    }
  }

  async generateCompetitionContent(options = {}) {
    const {
      competitionType = 'SPIN_WHEEL',
      storeName = 'Your Store',
      industry = 'retail',
      language = 'en',
      tone = 'friendly',
      targetAudience = 'general',
      brandInfo = {}
    } = options;

    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const prompt = this.buildContentPrompt({
        competitionType,
        storeName,
        industry,
        language,
        tone,
        targetAudience,
        brandInfo
      });

      let content;

      if (this.openai) {
        content = await this.generateWithOpenAI(prompt, language);
      } else {
        // Fallback to mock content
        content = this.generateMockContent(competitionType, storeName, language);
      }

      // Track usage
      this.usage.openai++;

      return {
        ...content,
        generated: true,
        service: this.openai ? 'openai' : 'mock',
        language,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Failed to generate AI content:', error);
      
      // Return fallback content on error
      return this.generateMockContent(competitionType, storeName, language);
    }
  }

  buildContentPrompt(options) {
    const { competitionType, storeName, industry, language, tone, targetAudience, brandInfo } = options;

    const competitionTypeMap = {
      SPIN_WHEEL: 'spinning wheel game',
      QUIZ: 'interactive quiz',
      INSTANT_WIN: 'instant win game',
      PHOTO_CONTEST: 'photo contest'
    };

    const competitionName = competitionTypeMap[competitionType] || 'competition';

    return `
Create engaging marketing content for a ${competitionName} for ${storeName}, an ${industry} business.

Context:
- Competition type: ${competitionName}
- Store name: ${storeName}
- Industry: ${industry}
- Target audience: ${targetAudience}
- Tone: ${tone}
- Language: ${language}
- Brand info: ${JSON.stringify(brandInfo)}

Generate the following content in ${language}:

1. Title (compelling and attention-grabbing, max 60 characters)
2. Description (engaging explanation of the competition, max 200 words)
3. Call to Action (action button text, max 20 characters)
4. Terms and Conditions (brief legal terms, max 300 words)
5. Social Sharing Message (for social media sharing, max 280 characters)

Make the content:
- Exciting and engaging
- Clear and easy to understand
- Appropriate for the ${tone} tone
- Relevant to ${industry} industry
- Appealing to ${targetAudience} audience
- Compliant with general contest regulations

Return as JSON with keys: title, description, callToAction, terms, socialShare
    `.trim();
  }

  async generateWithOpenAI(prompt, language) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert marketing copywriter specializing in e-commerce promotions and competitions. Generate engaging, compliant content that drives participation and sales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });

      const content = JSON.parse(response.choices[0].message.content);
      
      // Validate required fields
      const requiredFields = ['title', 'description', 'callToAction', 'terms', 'socialShare'];
      for (const field of requiredFields) {
        if (!content[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return content;
    } catch (error) {
      logger.error('OpenAI generation error:', error);
      throw error;
    }
  }

  async generateWithAnthropic(prompt, language) {
    // Placeholder for Anthropic integration
    try {
      // const response = await this.anthropic.completions.create({
      //   model: 'claude-3-sonnet-20240229',
      //   prompt: prompt,
      //   max_tokens: 1000
      // });
      
      throw new Error('Anthropic integration not implemented yet');
    } catch (error) {
      logger.error('Anthropic generation error:', error);
      throw error;
    }
  }

  generateMockContent(competitionType, storeName, language = 'en') {
    const templates = {
      en: {
        SPIN_WHEEL: {
          title: `🎡 Spin & Win at ${storeName}!`,
          description: `Join our exciting spinning wheel game and win amazing prizes! Every spin gives you a chance to save big on your favorite products. From discount codes to free shipping, incredible rewards await!`,
          callToAction: 'Spin Now!',
          terms: `This competition is open to customers 18 years and older. One spin per customer. Prizes must be redeemed within 30 days. Terms and conditions apply. The merchant reserves the right to modify or cancel this promotion at any time.`,
          socialShare: `I just won an amazing prize at ${storeName}'s Spin & Win game! 🎉 Check it out and try your luck too! #${storeName} #SpinToWin`
        },
        QUIZ: {
          title: `🧠 Test Your Knowledge at ${storeName}!`,
          description: `Think you know our products? Take our fun interactive quiz and prove it! Answer questions correctly and unlock exclusive discounts and special offers just for our smart shoppers.`,
          callToAction: 'Start Quiz',
          terms: `Quiz is open to customers 18 years and older. Maximum 3 attempts allowed. Minimum score of 70% required to win. Prizes must be redeemed within 30 days. Terms and conditions apply.`,
          socialShare: `I just aced the ${storeName} knowledge quiz! 🏆 Test your skills too and win great prizes! #${storeName} #Quiz`
        },
        INSTANT_WIN: {
          title: `⚡ Instant Win at ${storeName}!`,
          description: `Feeling lucky? Try our instant win game for a chance to win immediate prizes! No waiting, no delays - just instant excitement and amazing rewards delivered right to your inbox.`,
          callToAction: 'Try Now!',
          terms: `Instant win game is open to customers 18 years and older. One entry per customer per day. Winners will be notified immediately. Prizes must be redeemed within 30 days. Terms and conditions apply.`,
          socialShare: `Just won instantly at ${storeName}! 🎯 Your turn to try - amazing prizes waiting! #${storeName} #InstantWin`
        },
        PHOTO_CONTEST: {
          title: `📸 Photo Contest at ${storeName}!`,
          description: `Show us your creativity! Submit your best photos featuring our products or your ${storeName} experience. Our community will vote for their favorites, and winners take home fantastic prizes!`,
          callToAction: 'Submit Photo',
          terms: `Photo contest is open to customers 18 years and older. Photos must be original and appropriate. Voting period lasts 14 days. Winners will be announced publicly. By submitting, you grant usage rights. Terms and conditions apply.`,
          socialShare: `Just entered the ${storeName} photo contest! 📷 Check out the amazing entries and vote for your favorites! #${storeName} #PhotoContest`
        }
      }
    };

    // Get content for the specified language (fallback to English)
    const langTemplates = templates[language] || templates.en;
    const content = langTemplates[competitionType] || langTemplates.SPIN_WHEEL;

    return {
      ...content,
      generated: false,
      service: 'mock',
      language
    };
  }

  async enhanceContent(content, options = {}) {
    const {
      tone = 'friendly',
      length = 'medium',
      includeEmojis = true
    } = options;

    try {
      if (!this.openai) {
        return content; // Return original if no AI available
      }

      const prompt = `
Enhance the following marketing content to be more ${tone} and ${length} in length:

Title: ${content.title}
Description: ${content.description}
Call to Action: ${content.callToAction}

Make it more engaging while keeping the core message. ${includeEmojis ? 'Include relevant emojis.' : 'Do not use emojis.'}

Return as JSON with keys: title, description, callToAction
      `.trim();

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert copywriter specializing in marketing content enhancement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8,
        response_format: { type: 'json_object' }
      });

      const enhanced = JSON.parse(response.choices[0].message.content);
      
      return {
        ...content,
        ...enhanced,
        enhanced: true
      };
    } catch (error) {
      logger.error('Content enhancement error:', error);
      return content; // Return original on error
    }
  }

  getUsageStats() {
    return {
      ...this.usage,
      totalGenerated: this.usage.openai + this.usage.anthropic,
      servicesAvailable: {
        openai: !!this.openai,
        anthropic: !!this.anthropic
      }
    };
  }

  resetUsageStats() {
    this.usage = {
      openai: 0,
      anthropic: 0
    };
  }
}

// Create singleton instance
const aiContentService = new AIContentService();

module.exports = aiContentService;