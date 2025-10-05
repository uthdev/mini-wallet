import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Wallet } from '../wallet/entities/wallet.entity';
import { Transaction, TransactionStatus } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction) private readonly txRepo: Repository<Transaction>,
    @InjectRepository(Wallet) private readonly walletRepo: Repository<Wallet>,
    private configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async createAndSend(walletId: string, toAddress: string, amountBtc: number, userId: string): Promise<Transaction> {
    const token = this.configService.get('blockcypher.token');
    const base = this.configService.get('blockcypher.baseUrl');
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { id: walletId },
        relations: ['user'],
      });
      if (!wallet) throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
      if (wallet.user.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      const value = Math.round(amountBtc * 1e8);

      let tx = manager.create(Transaction, {
        fromAddress: wallet.address,
        toAddress,
        amount: amountBtc,
        status: TransactionStatus.PENDING,
        wallet,
      });
      tx = await manager.save(tx);

      try {
        const newTx = await axios.post(
          `${base}/txs/new?token=${token}`,
          { inputs: [{ addresses: [wallet.address] }], outputs: [{ addresses: [toAddress], value }] },
        );

        const sent = await axios.post(
          `${base}/txs/send?token=${token}`,
          newTx.data,
        );

        tx.txHash = sent.data?.tx?.hash ?? sent.data?.hash;
        tx.status = TransactionStatus.SENT;
        return manager.save(tx);
      } catch (e) {
        tx.status = TransactionStatus.FAILED;
        await manager.save(tx);
        throw new HttpException('Failed to send transaction', HttpStatus.BAD_GATEWAY);
      }
    });
  }

  async listByWallet(walletId: string, userId: string): Promise<Transaction[]> {
    const wallet = await this.walletRepo.findOne({ where: { id: walletId }, relations: ['user'] });
    if (!wallet) throw new HttpException('Wallet not found', HttpStatus.NOT_FOUND);
    if (wallet.user.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return this.txRepo.find({
      where: { wallet: { id: walletId } },
      order: { createdAt: 'DESC' },
    });
  }

  async refreshStatus(txId: string, userId: string): Promise<Transaction> {
    const base = this.configService.get('blockcypher.baseUrl');
    return this.dataSource.transaction(async (manager) => {
      const tx = await manager.findOne(Transaction, {
        where: { id: txId },
        relations: ['wallet', 'wallet.user'],
      });
      if (!tx) throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
      if (tx.wallet?.user.id !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      const { data } = await axios.get(`${base}/txs/${tx.txHash}`);
      tx.status = Number(data.confirmations) > 0 ? TransactionStatus.CONFIRMED : TransactionStatus.SENT;

      return manager.save(tx);
    });
  }
}