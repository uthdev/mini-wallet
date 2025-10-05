import { Field, ObjectType, ID, Float, registerEnumType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Wallet } from '../../wallet/entities/wallet.entity';

export enum TransactionStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}
registerEnumType(TransactionStatus, { name: 'TransactionStatus' });

@ObjectType()
@Entity('transactions')
export class Transaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  fromAddress: string;

  @Field()
  @Column()
  toAddress: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8 })
  amount: number; // BTC

  @Field({ nullable: true })
  @Column({ nullable: true })
  txHash?: string;

  @Field(() => TransactionStatus)
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @ManyToOne(() => Wallet, { onDelete: 'SET NULL', nullable: true })
  wallet?: Wallet;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}