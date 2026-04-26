import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { HealthController } from './infrastructure/adapters/inbound/health.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [],
})
export class PortfolioModule {}
