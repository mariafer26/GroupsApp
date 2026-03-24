
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# copiar el código
COPY . .

RUN mkdir -p public/uploads

#puerto
EXPOSE 3000

#comado para empezar
CMD ["node", "src/index.js"]