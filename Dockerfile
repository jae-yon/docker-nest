# --- build stage ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# --- production stage ---
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci --only=production 

COPY --from=build /app/dist ./dist

RUN apk add --no-cache curl

EXPOSE 5000

CMD ["node", "dist/main"]