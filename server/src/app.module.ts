import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { QuranModule } from './quran/quran.module';
import { TraderModule } from './trader/trader.module';
import { PerplexityModule } from './perplexity/perplexity.module';
import { NarrativeModule } from './narrative/narrative.module';
import { GeminiModule } from './gemini/gemini.module';
import { CalendarModule } from './calendar/calendar.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 🔑 VERY IMPORTANT
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    DatabaseModule,
    QuranModule,
    TraderModule,
    PerplexityModule,
    NarrativeModule,
    GeminiModule,
    CalendarModule,
  ],
})
export class AppModule {}
