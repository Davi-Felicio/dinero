import { Injectable } from '@nestjs/common';
import { IUseCase, Result } from '@dinero/shared';

export interface HealthCheckOutput {
  status: string;
  service: string;
  timestamp: string;
}

@Injectable()
export class HealthCheckUseCase implements IUseCase<void, HealthCheckOutput> {
  async execute(): Promise<Result<HealthCheckOutput>> {
    return Result.ok({
      status: 'ok',
      service: 'identity',
      timestamp: new Date().toISOString(),
    });
  }
}
