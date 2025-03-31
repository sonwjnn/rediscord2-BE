import { Controller, Post, Body, Request, UseGuards, Get, Param, Put, Inject, forwardRef } from '@nestjs/common';
import { AuthService, AuthResponse } from '@/modules/auth/auth.service';
import { UserService } from '@/modules/user/user.service';
import { JwtAuthGuard } from '@/modules/auth/guard/jwt.guard';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from './dto';
import { User } from '@prisma/client';
import { LocalAuthGuard } from '@/modules/auth/guard/local.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

@Controller('users')
export class UsersController {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req: RequestWithUser) {
    // Return user profile from JWT payload
    const { id, email, ...rest } = req.user;
    return { id, email, ...rest };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<User> | null> {
    return await this.userService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: RequestWithUser,
  ): Promise<Partial<User> | { message: string }> {
    // Check if user is updating their own profile
    if (req.user.id !== id) {
      return { message: 'You can only update your own profile' };
    }
    return await this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Request() req: RequestWithUser,
  ): Promise<Partial<User> | { message: string }> {
    // Check if user is updating their own password
    if (req.user.id !== id) {
      return { message: 'You can only update your own password' };
    }
    return await this.userService.updatePassword(id, updatePasswordDto);
  }
}