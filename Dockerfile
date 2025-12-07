# Build stage
FROM node:22-alpine AS builder

ARG NITRO_PRESET
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN

ENV NITRO_PRESET=${NITRO_PRESET} \
    SENTRY_ORG=${SENTRY_ORG} \
    SENTRY_PROJECT=${SENTRY_PROJECT} \
    SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /app

# Nuxt/Nitro bundles all dependencies, so node_modules is not needed
COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 8080

HEALTHCHECK CMD wget --no-verbose --spider http://localhost:8080/ || exit 1

# Use `docker run --init` or `init: true` in compose for proper signal handling
CMD ["node", ".output/server/index.mjs"]
