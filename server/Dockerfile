FROM node:20-bullseye

WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy rest of the code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build NestJS
RUN npm run build

EXPOSE 3000

# Run migrations + start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
