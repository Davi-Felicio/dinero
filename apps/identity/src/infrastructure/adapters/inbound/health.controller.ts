import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckOutput,
  HealthCheckUseCase,
} from '../../../application/use-cases/health-check.use-case';

@Controller('health')
export class HealthController {
  constructor(private readonly healthCheckUseCase: HealthCheckUseCase) {}

  @Get()
  async check(): Promise<HealthCheckOutput> {
    const result = await this.healthCheckUseCase.execute();
    return result.getValue();
  }
}
