import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(8, 100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  })
  password: string;

  @Field()
  @IsString()
  @Length(2, 50)
  name: string;
}
