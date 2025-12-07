# Build stage
FROM node:22-alpine AS builder

# Build arguments
ARG NITRO_PRESET
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN

ENV NITRO_PRESET=${NITRO_PRESET} \
    SENTRY_ORG=${SENTRY_ORG} \
    SENTRY_PROJECT=${SENTRY_PROJECT} \
    SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built application from builder stage
# Nuxt/Nitro bundles all dependencies, so node_modules is not needed
COPY --from=builder --chown=node:node /app/.output ./.output

# Use built-in non-root user from node image
USER node

# Expose port
EXPOSE 8080

# Environment defaults
ENV NODE_ENV=production \
    PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start the application
# Use `docker run --init` or `init: true` in compose for proper signal handling
CMD ["node", ".output/server/index.mjs"]
