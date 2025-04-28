import { ApiProperty } from '@nestjs/swagger';

export class AccountDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  providerAccountId: string;

  @ApiProperty({ required: false, nullable: true })
  refresh_token?: string | null;

  @ApiProperty({ required: false, nullable: true })
  access_token?: string | null;

  @ApiProperty({ required: false, nullable: true })
  expires_at?: number | null;

  @ApiProperty({ required: false, nullable: true })
  token_type?: string | null;

  @ApiProperty({ required: false, nullable: true })
  scope?: string | null;

  @ApiProperty({ required: false, nullable: true })
  id_token?: string | null;

  @ApiProperty({ required: false, nullable: true })
  session_state?: string | null;
} 