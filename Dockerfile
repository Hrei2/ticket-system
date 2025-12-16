FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install --prefix frontend && npm install --prefix backend

# Copy source code
COPY . .

# Build frontend
RUN npm run build --prefix frontend

# Expose port
EXPOSE 3001

# Start the backend server
CMD ["npm", "start", "--prefix", "backend"]