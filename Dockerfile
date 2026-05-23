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

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
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

# Copy all package files for production install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

# Copy source files needed for runtime
COPY packages/core/src/ ./packages/core/src/
COPY packages/hooks/src/ ./packages/hooks/src/

# Install ALL dependencies (workspace packages need their deps)
RUN pnpm install --frozen-lockfile

# Copy built frontend
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Copy compiled server (dist)
COPY --from=builder /app/server/dist ./server/dist

# Create data directory
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
