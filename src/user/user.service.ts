import { hashPassword, verifyPassword } from '@/helpers/password'
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { AuthProvidersEnum, User } from '@prisma/client'
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from './dto'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UserService {
  constructor(private readonly db: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Do not remove comment below.
    // <creating-property />

    let password: string | undefined = undefined

    if (createUserDto.password) {
      const salt = await bcrypt.genSalt()
      password = await bcrypt.hash(createUserDto.password, salt)
    }

    let email: string | null = null

    if (createUserDto.email) {
      const userObject = await this.db.user.findUnique({
        where: {
          email: createUserDto.email,
        },
      })
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailAlreadyExists',
          },
        })
      }
      email = createUserDto.email
    }

    if (createUserDto.name) {
      const userObject = await this.db.user.findUnique({
        where: {
          name: createUserDto.name,
        },
      })
      if (userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            name: 'nameAlreadyExists',
          },
        })
      }
    }

    return this.db.user.create({
      // Do not remove comment below.
      // <creating-property-payload />
      data: {
        name: createUserDto.name,
        email: email as string,
        password: password,
        image: null,
        provider: createUserDto.provider ?? AuthProvidersEnum.EMAIL,
        socialId: createUserDto.socialId,
      },
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { email },
    })
    return user
  }

  async findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email: usernameOrEmail,
          },
          {
            name: usernameOrEmail,
          },
        ],
      },
    })
    return user
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { id },
    })
    return user
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.db.user.findUnique({
      where: { name },
    })
    return user
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Partial<User>> {
    const updatedUser = await this.db.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        bio: true,
        status: true,
        cleaningDelay: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password and other sensitive fields
      },
    })
    return updatedUser
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<Partial<User>> {
    // Find the user
    const user = await this.db.user.findUnique({
      where: { id },
    })

    if (!user || !user.password) {
      throw new NotFoundException('User not found')
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      updatePasswordDto.currentPassword,
      user.password,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    // Hash the new password
    const hashedPassword = await hashPassword(updatePasswordDto.newPassword)

    // Update the password
    const updatedUser = await this.db.user.update({
      where: { id },
      data: { password: hashedPassword },
      select: {
        id: true,
        // Exclude password and other sensitive fields
      },
    })

    return updatedUser
  }

  async delete(id: string): Promise<User> {
    const deletedUser = await this.db.user.delete({
      where: { id },
    })
    return deletedUser
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email)

    if (!user || !user.password) {
      return null
    }

    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    const { password: _, ...result } = user
    return result
  }
}
