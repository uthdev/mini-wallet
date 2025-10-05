import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';
import { WalletResolver } from './wallet.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [WalletService, WalletResolver],
  exports: [WalletService],
})
export class WalletModule {}