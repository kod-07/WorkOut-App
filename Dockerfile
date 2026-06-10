# ==========================================
# STAGE 1: Build Frontend (Vite/React)
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependencies manifest
COPY frontend/package*.json ./
RUN npm install

# Copy source files
COPY frontend/ ./

# Inject VITE_API_URL at build-time (use relative path / in production)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build frontend (outputs to dist/)
RUN npm run build

# ==========================================
# STAGE 2: Build Backend (NestJS)
# ==========================================
FROM node:18-alpine AS backend-builder
WORKDIR /app

# Copy dependencies manifest
COPY package*.json ./
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma Client code
RUN npx prisma generate

# Copy NestJS source files and configs
COPY src ./src
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Build NestJS production bundles
RUN npm run build

# ==========================================
# STAGE 3: Final Runner
# ==========================================
FROM node:18-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=10000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy generated Prisma Client from builder to keep it in sync
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=backend-builder /app/prisma ./prisma

# Copy built NestJS backend
COPY --from=backend-builder /app/dist ./dist

# Copy static frontend assets (map Vite's dist to NestJS client/build)
COPY --from=frontend-builder /app/frontend/dist ./client/build

# Expose port
EXPOSE 10000

# Start up: Sync SQLite database and launch NestJS backend
CMD ["sh", "-c", "npx prisma db push && node dist/main.js"]
