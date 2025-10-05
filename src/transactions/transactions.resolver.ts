import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionInput } from './dto/create-transaction.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Transaction)
export class TransactionsResolver {
  constructor(private readonly txService: TransactionsService) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Transaction)
  createTransaction(
    @Args('input') input: CreateTransactionInput,
    @CurrentUser() user: User,
  ) {
    return this.txService.createAndSend(
      input.walletId,
      input.toAddress,
      input.amountBtc,
      user.id,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Transaction])
  walletTransactions(
    @Args('walletId') walletId: string,
    @CurrentUser() user: User,
  ) {
    return this.txService.listByWallet(walletId, user.id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Transaction)
  refreshTransactionStatus(
    @Args('txId') txId: string,
    @CurrentUser() user: User,
  ) {
    return this.txService.refreshStatus(txId, user.id);
  }
}
