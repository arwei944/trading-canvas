# TradingCanvas Dockerfile
# Port 7860 for Hugging Face Spaces compatibility

# Build stage
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy all package.json files first (for better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

# Install ALL dependencies (including devDependencies and workspace packages)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build workspace packages first (ensure they're properly linked)
RUN pnpm --filter @trading.canvas/core build 2>/dev/null || echo "No build script for core"
RUN pnpm --filter @trading.canvas/hooks build 2>/dev/null || echo "No build script for hooks"

# Build frontend
RUN pnpm --filter web build

# Verify dist was created
RUN ls -la /app/apps/web/dist/ && ls -la /app/apps/web/dist/assets/

# Production stage
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/hooks/package.json ./packages/hooks/
COPY apps/web/package.json ./apps/web/
COPY server/package.json ./server/

# Install production dependencies
# Note: We need to install workspace packages as well
RUN pnpm install --frozen-lockfile --prod

# Copy workspace packages source (they're used by the server)
COPY packages/core/src/ ./packages/core/src/
COPY packages/hooks/src/ ./packages/hooks/src/

# Copy built frontend
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Copy server source
COPY server/ ./server/

# Create data directory
RUN mkdir -p /app/data

# Environment defaults
ENV NODE_ENV=production
ENV PORT=7860
ENV DB_PATH=/app/data/trading-canvas.db
# Default encryption key (32 bytes) - should be changed in production
ENV ENCRYPTION_KEY=please-change-this-key-32-bytes!!
ENV SYNC_INTERVAL_MINUTES=5

# Port 7860 (Hugging Face Spaces requirement)
EXPOSE 7860

# Start server with tsx (TypeScript runtime)
CMD ["npx", "tsx", "server/src/index.ts"]
