import { registerAs } from '@nestjs/config'

import { IsOptional, IsString } from 'class-validator'
import validateConfig from '@/utils/validate-config'
import { ReplicateConfig } from './replicate-config.type'

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REPLICATE_API_TOKEN: string
}

export default registerAs<ReplicateConfig>('replicate', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)

  return {
    apiToken: process.env.REPLICATE_API_TOKEN,
  }
})
