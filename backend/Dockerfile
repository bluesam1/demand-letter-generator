# Backend Production Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --workspace=backend --only=production

# Copy backend source
COPY backend ./backend
COPY prisma ./backend/prisma

# Generate Prisma Client
RUN cd backend && npx prisma generate

# Build TypeScript
RUN cd backend && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/backend/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/prisma ./prisma
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \n  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start application
CMD ["node", "dist/index.js"]
