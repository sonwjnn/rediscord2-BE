import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/modules/auth/auth.module'
import { UserModule } from '@/modules/user/user.module'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { MailModule } from '@/modules/mail/mail.module'
import { MailerService } from '@/modules/mailer/mailer.service'
import { MailerModule } from '@/modules/mailer/mailer.module'
import { ProjectModule } from '@/modules/project/project.module'
import appConfig from '@/config/app.config'
import authConfig from '@/modules/auth/config/auth.config'
import mailConfig from '@/modules/mail/config/mail.config'
import { HeaderResolver, I18nModule } from 'nestjs-i18n'
import { AllConfigType } from '@/config/config.type'
import * as path from 'path'
import { AccountModule } from '@/modules/account/account.module'
import { AuthGoogleModule } from '@/modules/auth-google/auth-google.module'
import googleConfig from '@/modules/auth-google/config/google.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authConfig, appConfig, mailConfig, googleConfig],
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
    AuthGoogleModule,
    AuthModule,
    UserModule,
    PrismaModule,
    MailModule,
    MailerModule,
    ProjectModule,
  ],
  providers: [MailerService],
})
export class AppModule {}
