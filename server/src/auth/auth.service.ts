import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  // 🔐 REGISTER
  async register(
    name: string,
    email: string,
    password: string,
    country?: string,
    marketType?: string,
  ) {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await this.userModel.findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email: normalizedEmail,
      passwordHash,
      country,
      marketType,
      streak: 0,
    });

    return {
      message: 'User registered successfully',
      userId: user._id,
    };
  }

  // 🔐 LOGIN
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id, email: user.email };

    const token = jwt.sign(
      payload,
      this.configService.get<string>('JWT_SECRET')!,
      { expiresIn: '7d' },
    );

    return {
      accessToken: token,
      user: {
        id: user._id,
        email: user.email,
        streak: user.streak,
        country: user.country,
        marketType: user.marketType,
        sentiment: user.sentiment,
      },
    };
  }


  // 🔐 GET USER through token
  async getUser(token: string) {
    const decodedToken = jwt.verify(token, this.configService.get<string>('JWT_SECRET')!);
    const user = await this.userModel.findById(decodedToken.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id,
      email: user.email,
      streak: user.streak,
      country: user.country,
      marketType: user.marketType,
      sentiment: user.sentiment,
    };
  }

  // 🔐 UPDATE PROFILE
  async updateProfile(userId: string, updateData: any) {
    const user = await this.userModel.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user._id,
      email: user.email,
      streak: user.streak,
      country: user.country,
      marketType: user.marketType,
      sentiment: user.sentiment,
    };
  }
  
}
