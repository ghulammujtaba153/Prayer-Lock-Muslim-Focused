import { Controller, Post, Body, Patch, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      country?: string;
      marketType?: string;
    },
  ) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
      body.country,
      body.marketType,
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('get-user')
  async getUser(@Body() body: { token: string }) {
    return this.authService.getUser(body.token);
  }

  @Patch('profile')
  async updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() body: Record<string, any>,
  ) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET')!,
      ) as { sub: string; id: string };

      const userId = decoded.sub || decoded.id;
      return this.authService.updateProfile(userId, body);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
