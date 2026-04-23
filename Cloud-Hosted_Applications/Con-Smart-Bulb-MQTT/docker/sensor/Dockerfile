FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY sensor_client.js ./
CMD ["node", "sensor_client.js"]