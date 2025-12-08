ARG NODE_VERSION=22

# Stage 1: Build
FROM node:${NODE_VERSION}-alpine AS builder

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

# Stage 2: Production
FROM node:${NODE_VERSION}-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Nuxt/Nitro bundles all dependencies, so node_modules is not needed
COPY --from=builder --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

HEALTHCHECK CMD wget --no-verbose --spider http://127.0.0.1:3000/ || exit 1

# Use `docker run --init` or `init: true` in compose for proper signal handling
CMD ["node", ".output/server/index.mjs"]
