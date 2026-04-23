FROM node:20-slim
WORKDIR /app
# Context will be project root, so we look for package.json there
COPY package*.json ./
RUN npm install cors
RUN npm install --production
COPY server.js ./
# We don't need the frontend folder here because the UI is now isolated
EXPOSE 3000
CMD ["node", "server.js"]