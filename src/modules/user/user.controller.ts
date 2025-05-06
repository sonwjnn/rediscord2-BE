import {
  Controller,
  UseGuards,
  Get,
  Param,
  SerializeOptions,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
} from '@nestjs/common'
import { UserService } from '@/modules/user/user.service'
import { User } from '@prisma/client'
import { AuthGuard } from '@nestjs/passport'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import { NullableType } from '@/utils/types/nullable.type'
import { UserDto } from './domain/user'
import { UpdateUserDto } from './dto'

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @ApiOkResponse({
    type: UserDto,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: User['id']): Promise<NullableType<User>> {
    return this.userService.findById(id)
  }

  @ApiOkResponse({
    type: UserDto,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'email',
    type: String,
    required: true,
  })
  findByEmail(@Param('email') email: string): Promise<NullableType<User>> {
    return this.userService.findByEmail(email)
  }

  @ApiOkResponse({
    type: UserDto,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  update(
    @Param('id') id: User['id'],
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User | null> {
    return this.userService.update(id, updateProfileDto)
  }
}
