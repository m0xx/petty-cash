FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

copy . .

ENV SERVER_PORT=8000

EXPOSE 8000

CMD ["npm", "start"]