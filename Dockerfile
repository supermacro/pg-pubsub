FROM node:8.11.2

WORKDIR /app

COPY src ./src
COPY migrations ./migrations
COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY knexfile.js .

ENV POSTGRES_USER=gio POSTGRES_PASSWORD=testing123 POSTGRES_DB=my_db

RUN npm install && npm run build

CMD ["node", "./build/index.js"]
