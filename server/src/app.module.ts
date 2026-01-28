import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { QuranModule } from './quran/quran.module';
import { TraderModule } from './trader/trader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 🔑 VERY IMPORTANT
    }),
    AuthModule,
    DatabaseModule,
    QuranModule,
    TraderModule,
  ],
})
export class AppModule {}
