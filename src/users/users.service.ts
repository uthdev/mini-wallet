import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async create(input: CreateUserInput): Promise<User> {
    const hashed = await bcrypt.hash(input.password, 10);
    const user = this.repo.create({ ...input, password: hashed });
    const saved = await this.repo.save(user);
    this.logger.log(`User created: ${saved.email}`);
    return saved;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email }, relations: ['wallets'] });
  }

  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ['wallets'] });
  }
}
