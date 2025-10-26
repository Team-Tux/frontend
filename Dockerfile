# Stage 0, "build-stage", based on Node.js, to build and compile the frontend
FROM oven/bun:canary AS build-stage

WORKDIR /app

COPY package*.json /app/

RUN bun install

COPY ./ /app/

RUN bun run build


# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.28

COPY --from=build-stage /app/build/ /usr/share/nginx/html

COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./config/nginx-backend-not-found.conf /etc/nginx/extra-conf.d/backend-not-found.conf
