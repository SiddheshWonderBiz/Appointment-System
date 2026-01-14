FROM node:18-bullseye

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema FIRST
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy rest of the code
COPY . .

# Build NestJS
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
