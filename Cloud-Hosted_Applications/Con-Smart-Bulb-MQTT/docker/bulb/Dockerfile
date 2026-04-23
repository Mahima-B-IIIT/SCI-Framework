FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY bulb_client.js ./
CMD ["node", "bulb_client.js"]