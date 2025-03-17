FROM node:22-alpine

WORKDIR /app/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]