import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { UserFilesS3Service } from './files.service'
import { FileResponseDto } from './dto/file-response.dto'
import { UserFilesService } from '@/modules/user-files/user-files.service'
import { UserFileType } from '@/modules/user-files/domain/user-file'
import { NullableType } from '@/utils/types/nullable.type'

@ApiTags('User Files')
@Controller({
  path: 'user-files',
  version: '1',
})
export class UserFilesS3Controller {
  constructor(
    private readonly userFilesS3Service: UserFilesS3Service,
    private readonly userFilesService: UserFilesService,
  ) {}

  @ApiCreatedResponse({
    type: FileResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        fileType: {
          type: 'string',
          enum: ['PROFILE', 'DESIGN'],
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.MulterS3.File,
    @Request() req,
  ): Promise<FileResponseDto> {
    return this.userFilesS3Service.create(file, req.user.id, req.body.fileType)
  }

  @ApiOkResponse({
    type: UserFileType,
    isArray: true,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  async getFilesByUserId(
    @Request() req,
  ): Promise<NullableType<UserFileType[]>> {
    return this.userFilesService.findByUserId(req.user.id)
  }
}
