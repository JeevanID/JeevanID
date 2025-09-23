# JeevanID Backend API Documentation

## Overview
This is the backend API for JeevanID with comprehensive OTP (One-Time Password) functionality for user authentication and verification.

## Base URL
```
http://localhost:3000/api
```

## Features
- 📱 **SMS OTP via Twilio** (production)
- 📧 **Email OTP fallback** (backup)
- 🚀 **Mock SMS service** (development)
- 🔒 **Rate limiting** and security
- 📊 **Redis/Memory storage** for OTP data
- ✅ **Comprehensive validation**
- 🛡️ **JWT authentication**

## API Endpoints

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "JeevanID Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### OTP Endpoints

#### 1. Send OTP
```http
POST /api/otp/send
```

**Request Body:**
```json
{
  "mobileNumber": "+919876543210",
  "purpose": "login" // or "signup", "verification", "forgot-password"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to +919876543210",
  "data": {
    "expiryMinutes": "5",
    "provider": "mock",
    "messageId": "mock_1234567890",
    "otp": "123456",  // Only in demo mode
    "demoMode": true  // Only in demo mode
  }
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again later.",
  "data": {
    "maxRequests": 5,
    "windowMinutes": 15
  }
}
```

#### 2. Verify OTP
```http
POST /api/otp/verify
```

**Request Body:**
```json
{
  "mobileNumber": "+919876543210",
  "otp": "123456",
  "purpose": "login"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "verified": true,
    "mobileNumber": "+919876543210",
    "purpose": "login",
    "verifiedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP. Please try again.",
  "data": {
    "remainingAttempts": 2,
    "maxAttempts": 3
  }
}
```

#### 3. Resend OTP
```http
POST /api/otp/resend
```

**Request Body:**
```json
{
  "mobileNumber": "+919876543210",
  "purpose": "login"
}
```

**Response:** Same as Send OTP

#### 4. OTP Status (Development Only)
```http
GET /api/otp/status/:mobileNumber/:purpose
```

**Response:**
```json
{
  "success": true,
  "data": {
    "otpExists": true,
    "otpData": {
      "attempts": 0,
      "expiryTime": "2024-01-01T00:05:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "rateLimit": {
      "requests": 1,
      "maxRequests": 5,
      "exceeded": false
    },
    "config": {
      "demoMode": true,
      "demoOTP": "123456",
      "expiryMinutes": "5",
      "maxAttempts": "3"
    }
  }
}
```

---

### User Endpoints

#### 1. Register User
```http
POST /api/users/register
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "mobileNumber": "+919876543210",
  "dateOfBirth": "1990-01-01",
  "aadhaar": "123456789012"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_1234567890",
      "jeevanId": "JID-2024-ABC123DEF",
      "fullName": "John Doe",
      "mobileNumber": "+919876543210",
      "dateOfBirth": "1990-01-01",
      "profilePhoto": null,
      "verified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login User
```http
POST /api/users/login
```

**Request Body:**
```json
{
  "mobileNumber": "+919876543210"
  // OR
  // "jeevanId": "JID-2024-ABC123DEF"
}
```

**Response:** Same as Register User

#### 3. Get User Profile
```http
GET /api/users/profile/:identifier
```

**Parameters:**
- `identifier`: Mobile number or JeevanID

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_1234567890",
      "jeevanId": "JID-2024-ABC123DEF",
      "fullName": "John Doe",
      "mobileNumber": "+919876543210",
      "dateOfBirth": "1990-01-01",
      "profilePhoto": null,
      "verified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 4. List Users (Development Only)
```http
GET /api/users/list
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 5
  }
}
```

---

## Configuration

### Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# OTP Configuration
OTP_EXPIRY_MINUTES=5
OTP_LENGTH=6
MAX_OTP_ATTEMPTS=3

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=5

# Demo Mode
DEMO_MODE=true
DEMO_OTP=123456
```

### SMS Providers Supported

1. **Twilio** (Primary)
   - Production-ready
   - Global coverage
   - Reliable delivery

2. **Email** (Fallback)
   - Via SMTP
   - For regions where SMS is restricted

3. **Mock Service** (Development)
   - Console logging
   - No actual SMS sent
   - Perfect for testing

### Storage Options

1. **Redis** (Production)
   - Fast, scalable
   - Automatic expiry
   - Distributed support

2. **Memory** (Development)
   - Built-in fallback
   - No external dependencies
   - Automatic cleanup

---

## Usage Flow

### Complete Signup Flow
```
1. Frontend calls /api/otp/send (purpose: "signup")
2. User receives SMS with OTP
3. Frontend calls /api/otp/verify
4. If verified, frontend calls /api/users/register
5. User gets JWT token and is logged in
```

### Complete Login Flow
```
1. Frontend calls /api/otp/send (purpose: "login")
2. User receives SMS with OTP
3. Frontend calls /api/otp/verify
4. If verified, frontend calls /api/users/login
5. User gets JWT token and is logged in
```

---

## Testing

### Demo Mode Testing
Set `DEMO_MODE=true` in `.env` file:
- All OTPs will be `123456`
- SMS are logged to console
- No actual SMS charges

### API Testing with curl

**Send OTP:**
```bash
curl -X POST http://localhost:3000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "+919876543210", "purpose": "login"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "+919876543210", "otp": "123456", "purpose": "login"}'
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Validation failed | Invalid input data |
| 400 | OTP not found or expired | Need to request new OTP |
| 400 | Invalid OTP | Wrong OTP entered |
| 400 | Maximum attempts exceeded | Too many wrong attempts |
| 404 | User not found | User doesn't exist |
| 429 | Too many requests | Rate limit exceeded |
| 500 | Internal server error | Server-side error |

---

## Security Features

- ✅ **Rate limiting** per phone number
- ✅ **OTP expiry** (5 minutes default)
- ✅ **Attempt limiting** (3 attempts max)
- ✅ **Input validation** and sanitization
- ✅ **CORS protection**
- ✅ **Helmet security headers**
- ✅ **Hashed sensitive data** (Aadhaar)
- ✅ **JWT token** authentication

---

## Installation and Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server:**
```bash
npm run dev
```

4. **Start production server:**
```bash
npm start
```

---

## Production Deployment

1. Set `NODE_ENV=production`
2. Set `DEMO_MODE=false`
3. Configure real Twilio credentials
4. Setup Redis server
5. Use proper JWT secret
6. Configure proper CORS origins
7. Setup monitoring and logging