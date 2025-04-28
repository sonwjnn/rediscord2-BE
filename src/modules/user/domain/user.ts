import { Exclude, Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

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
    example: 'john.doe@example.com',
  })
  @Expose({ groups: ['me', 'admin'] })
  email: string

  @ApiProperty({
    type: Date,
  })
  emailVerified: Date | null

  @Exclude({ toPlainOnly: true })
  password?: string | null

  @ApiProperty({
    type: String,
  })
  image: string | null

  @ApiProperty({
    type: Boolean,
    default: false,
  })
  isTwoFactorEnabled: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
