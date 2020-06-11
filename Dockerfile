FROM node AS builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm install && npm install typescript@latest -g
RUN tsc

COPY --from=builder /usr/src/app/dist/ /usr/src/app
EXPOSE 3000
CMD [ "npm", "start" ]
