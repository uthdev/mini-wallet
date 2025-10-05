import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './entities/auth-response.entity';
import { User } from '../users/entities/user.entity';
import { GqlAuthGuard } from './gql-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => AuthResponse)
  async register(@Args('input') input: RegisterInput): Promise<AuthResponse> {
    return await this.auth.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    const user = await this.auth.validateUser(input.email, input.password);
    if (!user) throw new Error('Invalid credentials');
    const token = await this.auth.login({ id: user.id, email: user.email });
    return { accessToken: token, user };
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: any): Promise<Omit<User, 'password'>> {
    return await this.auth.getCurrentUser(user.userId);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(): Promise<boolean> {
    return true;
  }
}
