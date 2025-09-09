# ============================================================================
# DOCKERFILE FOR HOSPITAL MANAGEMENT BACKEND
# Multi-stage build để tối ưu kích thước image
# ============================================================================

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies first (including dev for Prisma)
RUN npm install --no-audit --no-fund

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install dumb-init and OpenSSL for proper signal handling and Prisma
RUN apk add --no-cache dumb-init openssl

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built dependencies from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Generate Prisma client (as root before switching user)
RUN npx prisma generate

# Create uploads directory
RUN mkdir -p uploads && chown nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
