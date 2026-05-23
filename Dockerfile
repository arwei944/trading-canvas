# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend
RUN pnpm --filter web build

# Production stage
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@8 --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built frontend
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Copy server source
COPY server/ ./server/
COPY packages/core/src/ ./packages/core/src/
COPY packages/hooks/src/ ./packages/hooks/src/

# Create data directory
RUN mkdir -p /app/data

# Environment
ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=/app/data/trading-canvas.db

EXPOSE 3001 5173

# Start both server and serve frontend
CMD ["node", "server/src/index.js"]
