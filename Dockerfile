FROM node:latest

RUN npm install -g nodemon forever

COPY package-lock.json /app/
COPY package.json /app/

WORKDIR /app/

RUN npm i

COPY . /app/

CMD ["forever", "start", "server.js"]