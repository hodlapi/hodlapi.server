FROM node:latest

RUN npm i -g mongoose-data-seed

COPY package-lock.json /app/
COPY package.json /app/

WORKDIR /app/

RUN npm i

COPY . /app/
