# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json nx.json tsconfig.base.json ./
RUN npm install --frozen-lockfile

ARG UI
ENV NX_DAEMON=false
COPY apps/$UI apps/$UI
COPY libs libs
RUN npx nx build $UI --prod

# Stage 2: Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

ARG UI
COPY --from=builder /app/dist/apps/$UI .

# Use the SPA-friendly default.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
