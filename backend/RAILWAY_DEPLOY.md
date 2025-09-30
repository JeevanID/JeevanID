# Railway Deployment Guide

## Environment Variables Required

Set these in your Railway dashboard:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h
```

## Deployment Process

1. Connect your GitHub repository to Railway
2. Set the environment variables above
3. Railway will automatically build and deploy using nixpacks.toml
4. Migrations will run automatically during build

## Health Check

- Health endpoint: `/api/health`
- Migrations table: `migrations`
- Users table: `users`