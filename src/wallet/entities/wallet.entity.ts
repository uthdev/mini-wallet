import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('wallets')
@Unique(['address'])
export class Wallet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  address: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 18, scale: 8, default: 0 })
  balance: number;

  @ManyToOne(() => User, (user) => user.wallets, { onDelete: 'CASCADE' })
  user: User;
}