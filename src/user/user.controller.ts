import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  Put,
  Inject,
  forwardRef,
  SerializeOptions,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { UserService } from '@/user/user.service'
import { JwtAuthGuard } from '@/auth/guard/jwt.guard'
import { UpdateUserDto, UpdatePasswordDto } from './dto'
import { User } from '@prisma/client'
import { AuthGuard } from '@nestjs/passport'
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { NullableType } from '@/utils/types/nullable.type'
import { DomainUser } from './domain/user'

interface RequestWithUser extends Request {
  user: {
    id: string
    email: string
    [key: string]: any
  }
}

@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly userService: UserService,
  ) {}

  @ApiOkResponse({
    type: DomainUser,
  })
  @Get('me')
  @HttpCode(HttpStatus.OK)
  getProfile(@Request() req: RequestWithUser) {
    console.log(req.user.id)
    return this.userService.findById(req.user.id)
  }

  @ApiOkResponse({
    type: DomainUser,
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
}
