import { Session } from "@prisma/client";

export type JwtRefreshPayloadType = {
  sessionId: Session['id']
  sessionToken: Session['sessionToken']
  iat: number
  exp: number
}