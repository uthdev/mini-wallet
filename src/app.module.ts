import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnvironmentVariables } from './config/env.validation';
import configuration from './config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [configuration],
      validate: validateEnvironmentVariables,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = process.env.DATABASE_URL;

        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: config.get<string>('nodeEnv') !== 'production',
            ssl:
              config.get<string>('nodeEnv') === 'production'
                ? { rejectUnauthorized: false }
                : false,
          };
        }

        return {
          type: 'postgres' as const,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.user'),
          password: config.get<string>('database.pass'),
          database: config.get<string>('database.name'),
          autoLoadEntities: true,
          synchronize: config.get<string>('nodeEnv') !== 'production',
        };
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      introspection: true,
      playground: false,
      plugins: [
        ApolloServerPluginInlineTrace(),
        ApolloServerPluginLandingPageLocalDefault({
          embed: true,
        }),
      ],
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    UsersModule,
    WalletModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
