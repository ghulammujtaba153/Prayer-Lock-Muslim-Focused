import { Module } from '@nestjs/common';
import { QuranController } from './quran.controller';
import { QuranService } from './quran.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { QuranSessionSchema, QuranSession } from './schemas/session.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule,
    AuthModule,
    MongooseModule.forFeature([
      { name: QuranSession.name, schema: QuranSessionSchema },
    ]),
  ],
  controllers: [QuranController],
  providers: [QuranService],
})
export class QuranModule {}
