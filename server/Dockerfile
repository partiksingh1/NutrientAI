# syntax=docker/dockerfile:1.7

# ---- Base image with Node runtime ----
FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

# Install OS deps needed for bcrypt and Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl ca-certificates libc6-dev build-essential python3 curl \
    && rm -rf /var/lib/apt/lists/*

# ---- Dependencies layer ----
FROM base AS deps
COPY server/package.json ./package.json
# If you later add a lockfile, copy it too for better caching
# COPY server/package-lock.json ./package-lock.json
RUN npm install --omit=dev

# ---- Build layer (TypeScript -> JS) ----
FROM base AS build
COPY server/package.json ./package.json
COPY server/tsconfig.json ./tsconfig.json
COPY server/src ./src
COPY server/prisma ./prisma
RUN npm install && npm run build

# Generate Prisma client (output is in ../generated per schema)
# Generate Prisma client and ensure generated output is copied later
RUN npx prisma generate

# ---- Runtime image ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN useradd -m nodeuser
USER nodeuser

# Copy built artifacts and production deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
# Copy generated Prisma client if output path is within project
COPY --from=build /app/generated ./generated
COPY server/package.json ./package.json

# Expose port and set start command
ENV PORT=3000
EXPOSE 3000

# Required runtime env vars (documented)
# - DATABASE_URL
# - JWT_SECRET
# - REFRESH_SECRET
# - REDIS_HOST
# - REDIS_PASSWORD

CMD ["node", "dist/index.js"]
