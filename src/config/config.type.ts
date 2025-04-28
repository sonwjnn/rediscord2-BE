import { GoogleConfig } from '@/modules/auth-google/config/google-config.type'
import { AuthConfig } from '@/modules/auth/config/auth-config.type'
import { AppConfig } from '@/config/app-config.type'
import { MailConfig } from '@/modules/mail/config/mail-config.type'

export type AllConfigType = {
  app: AppConfig
  auth: AuthConfig
  mail: MailConfig
  google: GoogleConfig
}
