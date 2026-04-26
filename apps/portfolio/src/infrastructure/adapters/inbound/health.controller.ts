import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): Record<string, string> {
    return { status: 'ok', service: 'portfolio', timestamp: new Date().toISOString() };
  }
}
