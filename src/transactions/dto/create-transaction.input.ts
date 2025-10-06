import { Field, Float, InputType } from '@nestjs/graphql';
import { IsUUID, IsString, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateTransactionInput {
  @Field()
  @IsUUID()
  walletId: string;

  @Field()
  @IsString()
  toAddress: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0.00000001)
  amountBtc: number;
}
