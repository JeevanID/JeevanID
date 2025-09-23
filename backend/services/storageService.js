const redis = require('redis');

class StorageService {
  constructor() {
    this.useRedis = process.env.REDIS_URL && process.env.NODE_ENV === 'production';
    this.memoryStorage = new Map(); // Fallback for development
    
    if (this.useRedis) {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL
      });
      
      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.useRedis = false; // Fallback to memory storage
      });
      
      this.redisClient.connect();
    }
  }

  // Generate storage key for OTP
  generateOTPKey(phoneNumber, purpose) {
    return `otp:${phoneNumber}:${purpose}`;
  }

  // Generate storage key for OTP attempts
  generateAttemptsKey(phoneNumber, purpose) {
    return `otp_attempts:${phoneNumber}:${purpose}`;
  }

  // Store OTP data
  async storeOTP(phoneNumber, purpose, otpData) {
    const key = this.generateOTPKey(phoneNumber, purpose);
    const data = {
      hash: otpData.hash,
      expiryTime: otpData.expiryTime,
      attempts: 0,
      createdAt: new Date()
    };

    try {
      if (this.useRedis) {
        await this.redisClient.setEx(
          key, 
          process.env.OTP_EXPIRY_MINUTES * 60, 
          JSON.stringify(data)
        );
      } else {
        // Memory storage with automatic cleanup
        this.memoryStorage.set(key, data);
        setTimeout(() => {
          this.memoryStorage.delete(key);
        }, process.env.OTP_EXPIRY_MINUTES * 60 * 1000);
      }
      
      return true;
    } catch (error) {
      console.error('Error storing OTP:', error);
      return false;
    }
  }

  // Retrieve OTP data
  async getOTP(phoneNumber, purpose) {
    const key = this.generateOTPKey(phoneNumber, purpose);
    
    try {
      let data;
      
      if (this.useRedis) {
        const result = await this.redisClient.get(key);
        data = result ? JSON.parse(result) : null;
      } else {
        data = this.memoryStorage.get(key);
      }
      
      if (!data) {
        return null;
      }
      
      // Check if OTP has expired
      if (new Date() > new Date(data.expiryTime)) {
        await this.deleteOTP(phoneNumber, purpose);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error retrieving OTP:', error);
      return null;
    }
  }

  // Increment OTP verification attempts
  async incrementAttempts(phoneNumber, purpose) {
    const key = this.generateOTPKey(phoneNumber, purpose);
    
    try {
      const data = await this.getOTP(phoneNumber, purpose);
      if (!data) {
        return false;
      }
      
      data.attempts += 1;
      
      if (this.useRedis) {
        const ttl = await this.redisClient.ttl(key);
        await this.redisClient.setEx(key, ttl, JSON.stringify(data));
      } else {
        this.memoryStorage.set(key, data);
      }
      
      return data.attempts;
    } catch (error) {
      console.error('Error incrementing attempts:', error);
      return false;
    }
  }

  // Delete OTP data
  async deleteOTP(phoneNumber, purpose) {
    const key = this.generateOTPKey(phoneNumber, purpose);
    
    try {
      if (this.useRedis) {
        await this.redisClient.del(key);
      } else {
        this.memoryStorage.delete(key);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting OTP:', error);
      return false;
    }
  }

  // Store rate limiting data
  async storeRateLimit(phoneNumber, purpose) {
    const key = `rate_limit:${phoneNumber}:${purpose}`;
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000; // 15 minutes
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;
    
    try {
      let requests;
      
      if (this.useRedis) {
        requests = await this.redisClient.incr(key);
        if (requests === 1) {
          await this.redisClient.expire(key, Math.floor(windowMs / 1000));
        }
      } else {
        const rateLimitData = this.memoryStorage.get(key) || { count: 0, resetTime: Date.now() + windowMs };
        
        if (Date.now() > rateLimitData.resetTime) {
          rateLimitData.count = 1;
          rateLimitData.resetTime = Date.now() + windowMs;
        } else {
          rateLimitData.count += 1;
        }
        
        this.memoryStorage.set(key, rateLimitData);
        requests = rateLimitData.count;
        
        // Cleanup after window expires
        setTimeout(() => {
          this.memoryStorage.delete(key);
        }, windowMs);
      }
      
      return {
        requests,
        maxRequests,
        exceeded: requests > maxRequests
      };
    } catch (error) {
      console.error('Error storing rate limit:', error);
      return { requests: 0, maxRequests, exceeded: false };
    }
  }

  // Get current rate limit status
  async getRateLimit(phoneNumber, purpose) {
    const key = `rate_limit:${phoneNumber}:${purpose}`;
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5;
    
    try {
      let requests;
      
      if (this.useRedis) {
        requests = await this.redisClient.get(key);
        requests = requests ? parseInt(requests) : 0;
      } else {
        const rateLimitData = this.memoryStorage.get(key);
        if (!rateLimitData || Date.now() > rateLimitData.resetTime) {
          requests = 0;
        } else {
          requests = rateLimitData.count;
        }
      }
      
      return {
        requests,
        maxRequests,
        exceeded: requests >= maxRequests
      };
    } catch (error) {
      console.error('Error getting rate limit:', error);
      return { requests: 0, maxRequests, exceeded: false };
    }
  }

  // Cleanup expired entries (for memory storage)
  startCleanupTask() {
    if (!this.useRedis) {
      setInterval(() => {
        const now = Date.now();
        for (const [key, data] of this.memoryStorage.entries()) {
          if (data.expiryTime && new Date(data.expiryTime) < now) {
            this.memoryStorage.delete(key);
          }
          if (data.resetTime && data.resetTime < now) {
            this.memoryStorage.delete(key);
          }
        }
      }, 60000); // Cleanup every minute
    }
  }
}

module.exports = new StorageService();