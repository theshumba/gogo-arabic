# GoGo Arabic Backend API

Production-grade Express 5 + MongoDB backend for the GoGo Arabic learning game.

## Features

- **Authentication**: JWT-based auth with httpOnly cookies and CSRF protection
- **Rate Limiting**: Multi-tiered rate limiting to prevent abuse
- **Validation**: Zod schemas for all inputs with automatic sanitization
- **Error Handling**: Centralized error handling with proper logging
- **Logging**: Structured logging with Winston (console + file)
- **Security**: Helmet, CORS whitelist, input sanitization
- **API Versioning**: `/api/v1/` prefix with backward compatibility
- **Type Safety**: Zod validation provides runtime type checking

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET` (minimum 32 characters)
- `MONGODB_URI` (your MongoDB connection string)
- `CORS_ORIGINS` (comma-separated allowed origins)

### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

### 4. Run Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000` by default.

## API Documentation

### Base URL
- **v1 (current)**: `/api/v1/`
- **Legacy**: `/api/` (redirects to v1)

### Authentication Endpoints

#### Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "Ahmed Hassan",
  "email": "ahmed@example.com",
  "password": "securepass123"
}

Response: { token, user }
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "securepass123"
}

Response: { token, user }
```

#### Verify Auth
```
GET /api/v1/auth/verify
Authorization: Bearer <token>

Response: { authenticated: true, user }
```

#### Logout
```
POST /api/v1/auth/logout
Authorization: Bearer <token>

Response: { message: "Logout successful" }
```

#### Get CSRF Token
```
GET /api/v1/auth/csrf-token

Response: { csrfToken: "..." }
```

### User Endpoints

#### Get Profile
```
GET /api/v1/user/profile
Authorization: Bearer <token>

Response: { user }
```

#### Update Profile
```
PUT /api/v1/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ahmed Hassan",
  "character": {
    "bodyType": "default",
    "skinTone": "medium",
    "outfit": "thobe_white",
    "headwear": null
  },
  "settings": {
    "volumeAmbience": 0.3,
    "volumeSFX": 0.5,
    "volumeWords": 0.7,
    "showTransliteration": true,
    "showDiacritics": true,
    "keyboardMode": "standard",
    "difficulty": "normal"
  }
}

Response: { user }
```

### Review/Vocabulary Endpoints

#### Get Cards
```
GET /api/v1/review/cards
Authorization: Bearer <token>

Response: { cards: [...] }
```

#### Sync Cards
```
POST /api/v1/review/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "cards": [
    {
      "wordId": "word_123",
      "due": "2024-01-15T10:00:00.000Z",
      "stability": 5.2,
      "difficulty": 3.5,
      "reps": 3,
      "lapses": 0,
      "state": 2
    }
  ]
}

Response: { cards: [...] }
```

### Quest Endpoints

#### Get Quests
```
GET /api/v1/quest/
Authorization: Bearer <token>

Response: { quests: [...] }
```

#### Sync Quests
```
POST /api/v1/quest/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "quests": [
    {
      "questId": "quest_first_word",
      "status": "completed",
      "progress": 1,
      "target": 1,
      "completedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}

Response: { quests: [...] }
```

### Shop Endpoints

#### Buy Item
```
POST /api/v1/shop/buy
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemId": "thobe_blue"
}

Response: { user }
```

### Game Save/Load Endpoints

#### Save Game
```
POST /api/v1/game/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "player": {
    "level": 5,
    "xp": 1250,
    "xpToNext": 1500,
    "dirhams": 150,
    "streak": 7,
    "wordsLearned": 25,
    "lettersLearned": 10,
    "totalQuizzes": 50,
    "correctAnswers": 42,
    "character": { ... },
    "inventory": ["thobe_white", "thobe_blue"]
  },
  "settings": { ... }
}

Response: { message, user }
```

#### Load Game
```
GET /api/v1/game/load
Authorization: Bearer <token>

Response: { user }
```

### Health Check
```
GET /api/v1/health

Response: { status: "ok", version: "v1", timestamp, uptime }
```

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Global | 100 req | 15 min |
| Auth (login/register) | 5 req | 15 min |
| API (authenticated) | 60 req | 1 min |
| Shop | 10 req | 1 min |

Rate limit headers are returned in responses:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining
- `RateLimit-Reset`: Time when limit resets

## Authentication Methods

### Method 1: Header-Based (Current Frontend)
```javascript
// Login
const { token } = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
}).then(r => r.json());

// Store token
localStorage.setItem('token', token);

// Use token in requests
fetch('/api/v1/user/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

### Method 2: Cookie-Based (Recommended)
```javascript
// Enable credentials
const fetchWithCredentials = (url, options = {}) =>
  fetch(url, { ...options, credentials: 'include' });

// Login (token stored in httpOnly cookie automatically)
await fetchWithCredentials('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Get CSRF token
const { csrfToken } = await fetchWithCredentials('/api/v1/auth/csrf-token')
  .then(r => r.json());

// Use in requests
fetchWithCredentials('/api/v1/user/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken
  },
  body: JSON.stringify(data)
})
```

## Error Responses

All errors follow this format:
```json
{
  "status": "fail",
  "message": "Descriptive error message"
}
```

Common status codes:
- `400` - Bad Request (validation failed, invalid input)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (CSRF validation failed)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (email already registered)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Environment Variables

See `.env.example` for all available options. Key variables:

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing JWTs (32+ chars recommended)

### Optional
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGINS` - Allowed origins (default: localhost:5173,localhost:3000)
- `JWT_EXPIRES_IN` - Token expiry (default: 7d)
- `RATE_LIMIT_*` - Rate limit configurations
- `LOG_LEVEL` - Logging verbosity (default: info)

## Logging

Logs are output to:
- **Console** (always)
- **Files** (production only)
  - `logs/combined.log` - All logs
  - `logs/error.log` - Errors only

Log format:
```
2024-01-15 10:30:45 [info] HTTP Request {
  method: "GET",
  path: "/api/v1/user/profile",
  statusCode: 200,
  duration: "25ms",
  userId: "507f1f77bcf86cd799439011"
}
```

## Security Best Practices

1. **Never commit `.env` files** - They're gitignored by default
2. **Use strong JWT_SECRET** - At least 32 random characters
3. **Set NODE_ENV=production** in production
4. **Use HTTPS** in production (required for secure cookies)
5. **Whitelist CORS origins** - Don't use wildcard in production
6. **Monitor logs** for suspicious activity
7. **Keep dependencies updated** - Run `npm audit` regularly

## Validation Schemas

Input validation uses Zod. See `/src/validation/` for all schemas.

Example validation error:
```json
{
  "status": "fail",
  "message": "Validation failed: email: Invalid email address, password: Password must be at least 6 characters"
}
```

## Development

### File Structure
```
server/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Route definitions
│   ├── utils/          # Utilities (logger, errors)
│   ├── validation/     # Zod schemas
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── logs/               # Log files (production)
├── .env.example        # Environment template
└── package.json
```

### Adding New Endpoints

1. Create validation schema in `/src/validation/`
2. Add controller function in `/src/controllers/`
3. Add route in `/src/routes/`
4. Apply appropriate middleware (auth, rate limit, validate)

Example:
```javascript
// validation/exampleSchemas.js
export const createThingSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.number().int().min(0)
});

// controllers/exampleController.js
export async function createThing(req, res, next) {
  try {
    const { name, value } = req.body;
    // ... logic
    res.status(201).json({ thing });
  } catch (err) {
    next(err);
  }
}

// routes/example.js
router.post(
  '/thing',
  apiLimiter,
  authenticate,
  validate(createThingSchema),
  createThing
);
```

## Testing

```bash
# Start test MongoDB
mongod --dbpath ./test-db

# Run tests (when implemented)
npm test
```

## Deployment

See [SECURITY.md](./SECURITY.md) for deployment checklist.

Basic steps:
1. Set environment variables on hosting platform
2. Ensure MongoDB is accessible
3. Set `NODE_ENV=production`
4. Configure `CORS_ORIGINS` to your domain
5. Use HTTPS
6. Set up log monitoring

## License

Private - Part of GoGo Arabic learning game

## Support

For issues or questions, contact the development team.
