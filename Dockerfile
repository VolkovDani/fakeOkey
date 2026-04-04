# Dockerfile for the frontend app
# Stage 1: Build the app using Bun
FROM node:25-trixie-slim AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lock
COPY . .

# Install dependencies
RUN npm i && npm run prod:client:build 

EXPOSE 3000

ENTRYPOINT ["npm", "run", "prod"]
