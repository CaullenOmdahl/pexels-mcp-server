FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --ignore-scripts

COPY . .

RUN npm run build

CMD ["node", "dist/main.js"]