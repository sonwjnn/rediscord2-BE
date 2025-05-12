import { registerAs } from '@nestjs/config'

import { IsOptional, IsString } from 'class-validator'
import validateConfig from '@/utils/validate-config'
import { UnsplashConfig } from './unsplash-config.type'

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  UNSPLASH_ACCESS_KEY: string

  @IsString()
  @IsOptional()
  UNSPLASH_SECRET_KEY: string

  @IsString()
  @IsOptional()
  UNSPLASH_APPLICATION_ID: string
}

export default registerAs<UnsplashConfig>('unsplash', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)

  return {
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    secretKey: process.env.UNSPLASH_SECRET_KEY,
    appId: process.env.UNSPLASH_APPLICATION_ID,
  }
})
