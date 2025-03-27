import { Controller, Get } from '@nestjs/common';

@Controller('')
export class HealthCheckController {
  @Get()
  checkHealth() {
    return 'client gateway is running';
  }
}
