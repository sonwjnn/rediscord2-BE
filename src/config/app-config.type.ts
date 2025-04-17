export type AppConfig = {
  nodeEnv: string
  name: string
  frontendDomain?: string
  workingDirectory: string
  backendDomain: string
  port: number
  apiPrefix: string
  fallbackLanguage: string
  headerLanguage: string
}
