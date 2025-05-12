import { ApiProperty } from '@nestjs/swagger'
import { UserFileType } from '@/modules/user-files/domain/user-file'

export class FileResponseDto {
  @ApiProperty({
    type: () => UserFileType,
  })
  file: UserFileType
}
