import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthResponse } from './entities/auth-response.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwt: JwtService, private users: UsersService) {}

  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.users.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    const { password, ...safe } = user;
    return safe;
  }

  async login(user: Pick<User, 'id' | 'email'>): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwt.sign(payload);
    this.logger.log(`User logged in: ${user.email}`);
    return token;
  }

  async register(input: { email: string; password: string; name: string }): Promise<AuthResponse> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new UnauthorizedException('Email already in use');
    const { password, ...created } = await this.users.create(input);
    const token = await this.login({ id: created.id, email: created.email });
    this.logger.log(`User registered: ${created.email}`);
    return { accessToken: token, user: created };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.users.findById(userId);
    const { password, ...safe } = user;
    return safe;
  }
}