# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json nx.json tsconfig.base.json ./
RUN npm install --frozen-lockfile

ARG SERVICE
COPY apps/$SERVICE apps/$SERVICE
COPY libs libs

RUN npx nx build $SERVICE --prod

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app
ARG SERVICE
COPY --from=builder /app/dist/apps/$SERVICE ./dist
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE ${PORT:-3005}
CMD ["node", "dist/main.js"]
