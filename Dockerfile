FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files for better layer caching
COPY package.json ./

# Install npm instead of pnpm since that's more widely supported
RUN npm install

# Copy source files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS release

WORKDIR /usr/src/app

# Copy only package files first (for better layer caching)
COPY package.json ./

# Only install production dependencies
RUN npm install --omit=dev

# Copy the built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Set default API key as empty (will be overridden by smithery config)
ENV PEXELS_API_KEY=""

# Run the application
CMD ["node", "dist/main.js"]