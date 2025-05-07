FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8

WORKDIR /usr/src/app

# Copy package files for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install dependencies with build tools
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS release

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm@8

# Copy only package files first (for better layer caching)
COPY package.json pnpm-lock.yaml* ./

# Only install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Set default API key as empty (will be overridden by smithery config)
ENV PEXELS_API_KEY=""

# Run the application
CMD ["node", "dist/main.js"]