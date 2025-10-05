import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsResolver } from './transactions.resolver';
import { Wallet } from '../wallet//entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet])],
  providers: [TransactionsService, TransactionsResolver],
})
export class TransactionsModule {}
