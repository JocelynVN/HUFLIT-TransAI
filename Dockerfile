FROM node:20-alpine AS base

# Install openssl and libc compatibility for Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl netcat-openbsd
RUN corepack enable && corepack prepare pnpm@10.7.0 --activate

WORKDIR /app

# Copy dependency manifests and prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma generate

# Copy the rest of the application
COPY . .

# Build the Next.js production bundle
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm build

# Ensure entrypoint is executable
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["pnpm", "start"]
