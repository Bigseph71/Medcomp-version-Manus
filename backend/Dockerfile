# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S medcom && \
    adduser -S medcom -u 1001 -G medcom

WORKDIR /app

# Copy built artifacts
COPY --from=builder --chown=medcom:medcom /app/dist ./dist
COPY --from=builder --chown=medcom:medcom /app/node_modules ./node_modules
COPY --from=builder --chown=medcom:medcom /app/package.json ./

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER medcom

EXPOSE 3000

CMD ["node", "dist/main.js"]
