# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript config and source files
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5002

# Create uploads directory
RUN mkdir -p public/uploads

# Start the application
CMD ["npm", "start"]
