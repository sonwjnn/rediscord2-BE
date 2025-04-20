import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/auth/auth.module'
import { UserModule } from '@/user/user.module'
import { PrismaModule } from '@/prisma/prisma.module'
import { MailModule } from './mail/mail.module'
import { MailerService } from './mailer/mailer.service'
import { MailerModule } from './mailer/mailer.module'
import appConfig from './config/app.config'
import authConfig from './auth/config/auth.config'
import mailConfig from './mail/config/mail.config'
import { HeaderResolver, I18nModule } from 'nestjs-i18n'
import { AllConfigType } from './config/config.type'
import * as path from 'path'
import { AccountModule } from './account/account.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, appConfig, mailConfig],
      envFilePath: ['.env'],
    }),
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ]
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    AccountModule,
    AuthModule,
    UserModule,
    PrismaModule,
    MailModule,
    MailerModule,
  ],
  providers: [MailerService],
})
export class AppModule {}
