import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { Param } from '@nestjs/common';
import { QuranService } from './quran.service';

@Controller('quran')
export class QuranController {
  constructor(private quranService: QuranService) {}

  @Get(':id')
  async getQuran(@Param('id') id: string) {
    const page = parseInt(id);
    return this.quranService.getQuranPage(page);
  }
}
