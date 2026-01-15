import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://appointment-system-blond.vercel.app/',
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
