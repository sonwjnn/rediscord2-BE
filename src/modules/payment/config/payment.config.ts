import { registerAs } from '@nestjs/config'

import { IsOptional, IsString } from 'class-validator'
import validateConfig from '@/utils/validate-config'
import { PaymentConfig } from './payment-config.type'

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  STRIPE_API_KEY: string

  @IsString()
  @IsOptional()
  STRIPE_WEBHOOK_SECRET: string

  @IsString()
  @IsOptional()
  STRIPE_PRICE_ID: string
}

export default registerAs<PaymentConfig>('payment', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)

  return {
    stripeApiKey: process.env.STRIPE_API_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripePriceId: process.env.STRIPE_PRICE_ID,
  }
})
