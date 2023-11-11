# inanna-backend/Dockerfile
FROM node:16

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn
RUN npx prisma generate

COPY . .

EXPOSE 3005

CMD ["node", "src/start-server.js"]
