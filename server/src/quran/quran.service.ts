import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Model } from 'mongoose';
import { QuranSession } from './schemas/session.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class QuranService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(QuranSession.name)
    private quranSessionModel: Model<QuranSession>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

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

  // create session and increment streak
  async createSession(userId: string, page: number) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = user.lastCompletedDate
      ? new Date(user.lastCompletedDate)
      : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    if (!lastDate) {
      // First session ever
      user.streak = 1;
    } else {
      const diffTime = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Next day - increment streak
        user.streak += 1;
      } else if (diffDays > 1) {
        // Missed day(s) - reset streak to 1
        user.streak = 1;
      }
      // If diffDays === 0 (same day), streak remains the same
    }

    user.lastCompletedDate = today;
    await user.save();

    const session = new this.quranSessionModel({
      user: user._id,
      page,
      streak: user.streak,
    });
    await session.save();

    return {
      session,
      streak: user.streak,
    };
  }

  // get streak history
  async getStreakHistory(userId: string) {
    const history = await this.quranSessionModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    const topStreak = history.reduce((max, session) => {
      return Math.max(max, session.streak || 0);
    }, 0);

    return { history, topStreak };
  }

  // get next page to read
  async getNextPage(userId: string) {
    const lastSession = await this.quranSessionModel
      .findOne({ user: userId })
      .sort({ createdAt: -1 });

    if (!lastSession) {
      return 1; // Start from page 1 if no history
    }

    const nextPage = lastSession.page + 1;
    return nextPage > 604 ? 1 : nextPage; // Wrap around after 604
  }
}
