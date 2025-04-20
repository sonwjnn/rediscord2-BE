import {
  Controller,
  Request,
  UseGuards,
  Get,
  Param,
  Inject,
  forwardRef,
  SerializeOptions,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
import { Account } from '@prisma/client'
import { AuthGuard } from '@nestjs/passport'
import { ApiOkResponse, ApiParam, ApiTags } from '@nestjs/swagger'
import { NullableType } from '@/utils/types/nullable.type'
import { AccountService } from './account.service'
import { AccountDto } from './dto/account.dto'


@UseGuards(AuthGuard('jwt'))
@ApiTags('Accounts')
@Controller({
  path: 'accounts',
  version: '1',
})
export class AccountsController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private readonly accountService: AccountService,
  ) {}

  @ApiOkResponse({
    type: AccountDto,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get('/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'userId',
    type: String,
    required: true,
  })
  findOne(@Param('userId') id: Account['userId']): Promise<NullableType<Account>> {
    return this.accountService.findByUserId(id)
  }

}

