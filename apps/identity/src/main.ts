import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IdentityModule } from './identity.module';
import { HttpExceptionFilter } from '@dinero/shared';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(IdentityModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('v1/identity');

  const port = process.env['IDENTITY_PORT'] ?? 3001;
  await app.listen(port);
  console.log(`[Identity] running on http://localhost:${port}`);
}

bootstrap();
