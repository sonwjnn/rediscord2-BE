import { AuthConfig } from '@/auth/config/auth-config.type'
import { AppConfig } from '@/config/app-config.type'
import { MailConfig } from '@/mail/config/mail-config.type'

export type AllConfigType = {
  app: AppConfig
  auth: AuthConfig
  mail: MailConfig
}
