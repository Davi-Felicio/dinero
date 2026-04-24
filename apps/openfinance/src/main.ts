import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { OpenfinanceModule } from './openfinance.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(OpenfinanceModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('v1/openfinance');

  const port = process.env['OPENFINANCE_PORT'] ?? 3004;
  await app.listen(port);
  console.log(`[OpenFinance] running on http://localhost:${port}`);
}

bootstrap();
