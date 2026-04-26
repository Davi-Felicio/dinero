import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { PortfolioModule } from './portfolio.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(PortfolioModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('v1/portfolio');

  const port = process.env['PORTFOLIO_PORT'] ?? 3003;
  await app.listen(port);
  console.log(`[Portfolio] running on http://localhost:${port}`);
}

bootstrap();
