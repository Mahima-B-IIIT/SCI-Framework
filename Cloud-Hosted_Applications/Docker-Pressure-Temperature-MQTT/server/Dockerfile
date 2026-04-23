FROM node:18-slim
WORKDIR /app
# Copy dependency files first for better caching
COPY package*.json ./
RUN npm install
# Copy the rest of the code
COPY . .
# The server runs index.js by default
CMD ["node", "index.js"]