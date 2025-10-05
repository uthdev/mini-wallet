import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Wallet } from './entities/wallet.entity';
import { WalletService } from './wallet.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Wallet)
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Wallet)
  createWallet(@CurrentUser() user: User) {
    return this.walletService.createForUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Wallet])
  myWallets(@CurrentUser() user: User) {
    return this.walletService.getByUser(user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Wallet)
  refreshWalletBalance(
    @Args('walletId') walletId: string,
    @CurrentUser() user: User,
  ) {
    return this.walletService.refreshBalance(walletId, user.id);
  }
}