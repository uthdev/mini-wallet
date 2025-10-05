import { Field, Float, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTransactionInput {
  @Field()
  walletId: string;

  @Field()
  toAddress: string;

  @Field(() => Float)
  amountBtc: number;
}
