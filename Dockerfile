FROM node:22-alpine

WORKDIR /app

# Copy package manifests and npm config first for fast layer caching
COPY package*.json .npmrc* ./

# Install all dependencies cleanly
RUN npm install --legacy-peer-deps

# Copy application source
COPY . .

# Build the production Vite frontend bundle into dist/
RUN npm run build

# Ensure persistent records directory exists
RUN mkdir -p /app/data

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
