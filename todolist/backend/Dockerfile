FROM node:20-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 4000

CMD ["/app/entrypoint.sh"]
