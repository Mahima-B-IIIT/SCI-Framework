FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# No CMD here, we'll define it in docker-compose.yml