import { FileConfig } from '@/modules/files/config/file-config.type'
import { GoogleConfig } from '@/modules/auth-google/config/google-config.type'
import { AuthConfig } from '@/modules/auth/config/auth-config.type'
import { AppConfig } from '@/config/app-config.type'
import { MailConfig } from '@/modules/mail/config/mail-config.type'
import { PaymentConfig } from '@/modules/payment/config/payment-config.type'
import { UnsplashConfig } from '@/modules/unsplash/config/unsplash-config.type'
import { ReplicateConfig } from '@/modules/replicate/config/replicate-config.type'

export type AllConfigType = {
  app: AppConfig
  auth: AuthConfig
  mail: MailConfig
  google: GoogleConfig
  payment: PaymentConfig
  file: FileConfig
  unsplash: UnsplashConfig
  replicate: ReplicateConfig
}
