FROM node:12.19.1-alpine

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV CHROMIUM_PATH /usr/bin/chromium-browser
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium-browser

RUN apk add --no-cache  chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main

RUN which chromium-browser

COPY . .

# RUN npm install -g yarn

RUN yarn install

ENTRYPOINT [ "yarn", "start" ]
