import { Injectable, Inject, forwardRef, ForbiddenException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@/modules/user/user.service';
import { verifyPassword } from '@/helpers/password';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "@/prisma";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
import { v4 as uuidv4 } from 'uuid';

// Define the AuthResponse interface
export interface AuthResponse {
  access_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService,
    private db: PrismaService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && user.password) {
      const isValid = await verifyPassword(password, user.password);
      if (isValid) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async validateUserById(id: string): Promise<any> {
    const user = await this.userService.findById(id);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  signup(dto: RegisterDto) {
    try {
      return this.userService.create(dto);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signToken(
    userId: string,
  ) {
    const payload = {
      sub: userId,
      version: uuidv4()
    };

    const token = await this.jwtService.signAsync(
      payload,
    );

    return token
  }
}
