# ============================
# 🏗️ Build Stage
# ============================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfiles and install all dependencies (including dev)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy source code and build
COPY . .
RUN pnpm exec tsc -p tsconfig.build.json

# ============================
# 🚀 Production Stage
# ============================
FROM node:20-alpine AS production

RUN npm install -g pnpm
WORKDIR /app

# Copy only production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output and env
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

EXPOSE 3000
CMD ["node", "dist/main"]