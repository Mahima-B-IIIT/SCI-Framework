FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# The controller runs control.js
CMD ["node", "control.js"]