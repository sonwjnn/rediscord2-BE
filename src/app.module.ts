import * as path from 'path'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@/modules/auth/auth.module'
import { UserModule } from '@/modules/user/user.module'
import { PrismaModule } from '@/modules/prisma/prisma.module'
import { UnsplashModule } from '@/modules/unsplash/unsplash.module'
import { MailModule } from '@/modules/mail/mail.module'
import { MailerService } from '@/modules/mailer/mailer.service'
import { MailerModule } from '@/modules/mailer/mailer.module'
import { ProjectModule } from '@/modules/project/project.module'
import { UserFilesModule } from '@/modules/user-files/user-files.module'

import { HeaderResolver, I18nModule } from 'nestjs-i18n'
import { AccountModule } from '@/modules/account/account.module'
import { AuthGoogleModule } from '@/modules/auth-google/auth-google.module'
import { PaymentModule } from './modules/payment/payment.module'
import { AllConfigType } from '@/config/config.type'

import googleConfig from '@/modules/auth-google/config/google.config'
import appConfig from '@/config/app.config'
import authConfig from '@/modules/auth/config/auth.config'
import mailConfig from '@/modules/mail/config/mail.config'
import paymentConfig from '@/modules/payment/config/payment.config'
import fileConfig from '@/modules/files/config/file.config'
import unsplashConfig from '@/modules/unsplash/config/unsplash.config'
import replicateConfig from './modules/replicate/config/replicate.config'
import { ReplicateModule } from './modules/replicate/replicate.module'
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        authConfig,
        appConfig,
        mailConfig,
        googleConfig,
        paymentConfig,
        fileConfig,
        unsplashConfig,
        replicateConfig,
      ],
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
    UserFilesModule,
    ReplicateModule,
    UnsplashModule,
    AccountModule,
    AuthGoogleModule,
    AuthModule,
    UserModule,
    PrismaModule,
    MailModule,
    MailerModule,
    ProjectModule,
    PaymentModule,
  ],
  providers: [MailerService],
})
export class AppModule {}
