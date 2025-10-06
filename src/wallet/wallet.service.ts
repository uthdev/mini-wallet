import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Wallet } from './entities/wallet.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    private configService: ConfigService,
  ) {}

  async createForUser(userId: string): Promise<Wallet> {
    const token = this.configService.get('blockcypher.token');
    const base = this.configService.get('blockcypher.baseUrl');

    try {
      const { data } = await axios.post(`${base}/addrs?token=${token}`);
      const wallet = this.walletRepo.create({
        address: data.address,
        privateKey: data.private,
        publicKey: data.public,
        balance: 0,
        user: { id: userId } as any,
      });
      return await this.walletRepo.save(wallet);
    } catch {
      throw new HttpException(
        'Failed to create wallet address',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getByUser(userId: string): Promise<Wallet[]> {
    return this.walletRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { address: 'ASC' },
    });
  }

  async refreshBalance(walletId: string, userId: string): Promise<Wallet> {
    const base = this.configService.get('blockcypher.baseUrl');
    const wallet = await this.walletRepo.findOne({
      where: { id: walletId },
      relations: ['user'],
    });
    if (!wallet)
      throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    if (wallet.user.id !== userId)
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const { data } = await axios.get(`${base}/addrs/${wallet.address}/balance`);
    const satoshis = Number(data.balance) + Number(data.unconfirmed_balance);
    wallet.balance = satoshis / 1e8;

    return this.walletRepo.save(wallet);
  }
}
