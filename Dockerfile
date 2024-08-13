FROM node:20-alpine

WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Install dependencies into /app/node_modules
RUN npm ci

CMD command param1 param2
