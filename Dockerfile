FROM node:22.22.1-alpine3.22

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000 4001 4002 4003 4004 4005

CMD ["npm", "run", "start:all"]
