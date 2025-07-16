# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with timeout
RUN npm install --legacy-peer-deps --timeout=300000

# Copy source code
COPY . .

# Set environment variable
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build with timeout
RUN timeout 600 npm run build || npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files
COPY --from=build /app/build ./build

# Expose port
EXPOSE $PORT

# Start server
CMD ["sh", "-c", "serve -s build -p $PORT"]