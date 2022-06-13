FROM mhart/alpine-node:12 as build
WORKDIR /app
COPY . .

RUN npm install
RUN npm run build

FROM mhart/alpine-node:12 AS deps

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci --prod

COPY static static
COPY __sapper__ __sapper__

FROM mhart/alpine-node:slim-12

WORKDIR /app

COPY --from=deps /app .

EXPOSE 3000
CMD ["node", "__sapper__/build"]
