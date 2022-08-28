FROM node:16-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm install -g forever
COPY . .
EXPOSE 8081 2560
CMD ["forever", "main.js"]
