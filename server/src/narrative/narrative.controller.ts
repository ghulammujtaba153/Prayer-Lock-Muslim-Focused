import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { NarrativeService } from './narrative.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Controller('narrative')
export class NarrativeController {
  constructor(
    private narrativeService: NarrativeService,
    private configService: ConfigService,
  ) {}

  @Get()
  async getNarrative(
    @Headers('authorization') authHeader: string,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET')!,
      );
      const userId = decoded.sub || decoded.id;
      return this.narrativeService.getPersonalizedNarrative(userId);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
