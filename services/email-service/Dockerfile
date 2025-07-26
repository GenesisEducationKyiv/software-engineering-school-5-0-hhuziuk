FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/proto ./proto

ENV NODE_ENV=production

# HTTP endpoint
EXPOSE 4000
# gRPC endpoint
EXPOSE 50051

CMD ["sh", "-c", "node dist/main.js & node dist/grpc.js"]
