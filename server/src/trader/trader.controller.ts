import { Controller, Get } from '@nestjs/common';
import { TraderService } from './trader.service';
import { EconomicTrends } from './interfaces/trends.interface';

@Controller('trader')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @Get('trends')
  async getTrends(): Promise<EconomicTrends> {
    return this.traderService.getEconomicTrends();
  }
}
