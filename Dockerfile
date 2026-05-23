# TradingCanvas Dockerfile
# Optimized for Hugging Face Spaces (port 7860)

# ==================== Build Stage ====================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

RUN pnpm install --frozen-lockfile

COPY . .

# Build shared packages
RUN pnpm --filter @trading.canvas/core build
RUN pnpm --filter @trading.canvas/hooks build

# Build frontend
RUN pnpm --filter web build

# Build server (compile TypeScript to JavaScript)
RUN pnpm --filter @trading.canvas/server build

# ==================== Production Stage ====================
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built frontend
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Copy compiled server (dist)
COPY --from=builder /app/server/dist ./server/dist

# Copy necessary source for runtime (if any)
COPY packages/core/src/ ./packages/core/src/
COPY packages/hooks/src/ ./packages/hooks/src/

RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=7860
ENV DB_PATH=/app/data/trading-canvas.db
ENV ENCRYPTION_KEY=please-change-this-key-32-bytes!!
ENV SYNC_INTERVAL_MINUTES=5

EXPOSE 7860

# Health check for Hugging Face Spaces
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7860/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use compiled JS to start (stable & fast)
CMD ["node", "server/dist/index.js"]
