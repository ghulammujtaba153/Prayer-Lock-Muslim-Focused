import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QuranService {
  constructor(private readonly httpService: HttpService) {}

  async getQuranPage(page: number) {
    const arabicUrl = `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`;
    const englishUrl = `https://api.alquran.cloud/v1/page/${page}/en.sahih`;

    const [arabicRes, englishRes] = await Promise.all([
      firstValueFrom(this.httpService.get(arabicUrl)),
      firstValueFrom(this.httpService.get(englishUrl)),
    ]);

    const arabicAyahs = arabicRes.data.data.ayahs;
    const englishAyahs = englishRes.data.data.ayahs;

    const ayahs = arabicAyahs.map((a, index) => ({
      ayahNumber: a.numberInSurah,
      surah: a.surah.englishName,
      arabic: a.text,
      translation: englishAyahs[index]?.text ?? '',
    }));

    return {
      page,
      ayahs,
    };
  }
}
