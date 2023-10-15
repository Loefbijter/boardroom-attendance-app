FROM node:lts
WORKDIR /var/www/html/app/
COPY package.json .
RUN npm install
COPY . .