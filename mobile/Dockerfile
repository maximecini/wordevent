FROM node:20-slim

WORKDIR /app

RUN npm install -g expo-cli

COPY package*.json ./
RUN npm install

COPY . .

CMD ["sh", "-c", "npm install && npx expo start --go --lan"]
