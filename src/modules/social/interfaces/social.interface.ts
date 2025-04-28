import { ProviderType } from '@/utils/types/provider.type'

export interface SocialInterface {
  id: string
  firstName?: string
  lastName?: string
  type: ProviderType
  email?: string
}
