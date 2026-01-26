import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { QuranService } from './quran.service';

@Controller('quran')
export class QuranController {
  constructor(private quranService: QuranService) {}

  @Get(':id')
  async getQuran(@Param('id') id: string) {
    const page = parseInt(id);
    return this.quranService.getQuranPage(page);
  }

  @Post('session')
  async createSession(@Body() body: { userId: string; page: number }) {
    return this.quranService.createSession(body.userId, body.page);
  }

  @Get('streak-history/:userId')
  async getStreakHistory(@Param('userId') userId: string) {
    return this.quranService.getStreakHistory(userId);
  }
}
