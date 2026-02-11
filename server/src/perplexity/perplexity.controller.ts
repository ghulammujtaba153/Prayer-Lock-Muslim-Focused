import { Controller, Get, Post } from '@nestjs/common';
import { PerplexityService } from './perplexity.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('perplexity')
@Controller('perplexity')
export class PerplexityController {
  constructor(private readonly perplexityService: PerplexityService) {}

  @Get()
  @ApiOperation({ summary: 'Get the most recent economic data from DB' })
  async getLatest() {
    return this.perplexityService.getLatestData();
  }

  @Post('sync')
  @ApiOperation({ summary: 'Manually trigger data sync from Perplexity API' })
  async manualSync() {
    return this.perplexityService.syncData();
  }
}
