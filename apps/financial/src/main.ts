import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FinancialModule } from './financial.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(FinancialModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('v1/financial');

  const port = process.env['FINANCIAL_PORT'] ?? 3002;
  await app.listen(port);
  console.log(`[Financial] rodando em http://localhost:${port}`);
}

bootstrap();
