FROM node:latest

RUN npm install -g nodemon pm2

COPY package-lock.json /app/
COPY package.json /app/

WORKDIR /app/

RUN npm i

COPY . /app/

CMD ["pm2-runtime", "server.js"]