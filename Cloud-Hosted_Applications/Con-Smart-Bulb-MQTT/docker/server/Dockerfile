FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY server.js ./
# We keep 3000 for the HTTP Alert Test/Stats
EXPOSE 3000
CMD ["node", "server.js"]