# Deployment Guide

**Project:** Steno - Demand Letter Generator
**Version:** 1.0 (MVP)
**Last Updated:** 2025-12-04

## Overview

This guide covers deploying the Steno Demand Letter Generator in both local development and production environments.

## Quick Start

### Local Development

```bash
npm install
npm run db:setup
npm run dev
```

### Production

```bash
npm run build:prod
npm run db:migrate:prod
npm run start:prod
```

## Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15.x
- Docker >= 24.x (optional)

## Environment Variables

Copy .env.example to .env and configure:

- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Generate with openssl rand -base64 64
- ANTHROPIC_API_KEY: Claude API key
- NODE_ENV: production

See .env.example for complete reference.

## Database Setup

### Local (Docker)

```bash
npm run db:setup
```

### Production (AWS RDS)

```bash
# Set DATABASE_URL to RDS endpoint
npm run db:migrate:prod
```

## Build & Deploy

### Build Application

```bash
npm run build:prod
```

Output:
- Frontend: frontend/dist/
- Backend: backend/dist/

### Production Server

```bash
npm run start:prod
```

### Docker Deployment

```bash
npm run docker:build
npm run docker:up
npm run docker:logs
```

## Health Checks

```bash
curl http://localhost:3001/api/health
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Letters
- GET /api/letters
- POST /api/letters
- GET /api/letters/:id
- PATCH /api/letters/:id

### AI
- POST /api/ai/generate
- POST /api/ai/refine

### Templates
- GET /api/templates
- POST /api/templates

### Export
- POST /api/export/word
- POST /api/export/pdf

## Troubleshooting

### Database Connection Issues
```bash
docker ps | grep postgres
echo $DATABASE_URL
```

### Port in Use
```bash
lsof -i :3001
# Change PORT in .env
```

## Security Checklist

- [ ] Change JWT_SECRET to secure value
- [ ] Use strong database passwords
- [ ] Enable SSL for database
- [ ] Set NODE_ENV=production
- [ ] Configure CORS_ORIGINS
- [ ] Enable HTTPS
- [ ] Run npm audit

## Deployment Checklist

- [ ] Tests passing (npm test)
- [ ] Lint passing (npm run lint)
- [ ] Build successful
- [ ] Environment configured
- [ ] Migrations applied
- [ ] Health checks pass

## AWS Cloud Deployment

For complete AWS deployment (Lambda, RDS, S3, CloudFront), see:
- docs/architecture/deployment.md

## Support

For issues, consult:
1. Application logs
2. docs/architecture/
3. GitHub issues
