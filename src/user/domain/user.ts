import { Exclude, Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { Statuses, CleaningDelay, TwoFactorConfirmation } from '@prisma/client'

export class DomainUser {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    type: String,
    example: 'johndoe',
  })
  name: string | null

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName: string | null

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email: string

  @ApiProperty({
    type: Date,
  })
  emailVerified: Date | null

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialId: string | null

  @Exclude({ toPlainOnly: true })
  password?: string | null

  @ApiProperty({
    type: String,
  })
  image: string | null

  @ApiProperty({
    type: String,
  })
  bio: string | null

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  isTwoFactorEnabled: boolean

  @ApiProperty({
    enum: Statuses,
    default: Statuses.ONLINE,
  })
  status: Statuses

  @ApiProperty({
    enum: CleaningDelay,
    default: CleaningDelay.DO_NOT_CLEAN,
  })
  cleaningDelay: CleaningDelay

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
