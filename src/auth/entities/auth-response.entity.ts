import { ObjectType, Field, PickType, OmitType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => User, { nullable: true })
  user?: Omit<User, 'password'>;
}
