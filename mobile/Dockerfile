FROM node:20-alpine

WORKDIR /app

RUN npm install -g expo-cli @expo/ngrok@^4.1.0

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npx", "expo", "start", "--tunnel"]
