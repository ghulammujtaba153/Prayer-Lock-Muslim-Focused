import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NarrativeController } from './narrative.controller';
import { NarrativeService } from './narrative.service';
import { Narrative, NarrativeSchema } from './schemas/narrative.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { PerplexityModule } from '../perplexity/perplexity.module';
import { TraderModule } from '../trader/trader.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Narrative.name, schema: NarrativeSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PerplexityModule,
    TraderModule,
  ],
  controllers: [NarrativeController],
  providers: [NarrativeService],
})
export class NarrativeModule {}
