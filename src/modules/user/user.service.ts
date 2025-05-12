import { ApiUnprocessableEntityException } from '@/utils/exception'
import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { User } from '@prisma/client'
import { CreateUserDto, UpdateUserDto } from './dto'
import * as bcrypt from 'bcryptjs'
import { NullableType } from '@/utils/types/nullable.type'
import { ApiConflictException } from '@/utils/exception'
import { ConfigService } from '@nestjs/config'
import { getS3ImageUrl } from '@/utils/get-s3-image-url'
import { UserDto } from './domain/user'

@Injectable()
export class UserService {
  constructor(
    private readonly db: PrismaService,
    private readonly configService: ConfigService,
  ) {}

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
        throw new ApiConflictException('emailExists')
      }
      email = createUserDto.email
    }

    if (createUserDto.username) {
      const userObject = await this.findByUsername(createUserDto.username)
      if (userObject) {
        throw new ApiConflictException('usernameExists')
      }
    }

    return this.db.user.create({
      // Do not remove comment below.
      // <creating-property-payload />
      data: {
        username: createUserDto.username,
        email: email as string,
        password: password,
        ...(createUserDto.name ? { name: createUserDto.name } : {}),
      },
    })
  }

  findByEmail(email: string): Promise<NullableType<User>> {
    return this.db.user.findUnique({
      where: { email },
    })
  }

  async findBySocialIdAndProvider(data: {
    socialId: string
    provider: string
  }): Promise<NullableType<User>> {
    const existingAccount = await this.db.account.findFirst({
      where: {
        provider: data.provider,
        providerAccountId: data.socialId,
      },
      include: {
        user: true,
      },
    })

    if (!existingAccount) {
      return null
    }

    return existingAccount?.user
  }

  findByUsernameOrEmail(usernameOrEmail: string): Promise<NullableType<User>> {
    return this.db.user.findFirst({
      where: {
        OR: [
          {
            email: usernameOrEmail,
          },
          {
            username: usernameOrEmail,
          },
        ],
      },
    })
  }

  async findById(id: User['id']): Promise<NullableType<UserDto>> {
    const user = await this.db.user.findUnique({
      where: { id },
    })

    if (!user) {
      return null
    }

    const userImage = await this.db.userFiles.findFirst({
      where: { userId: user.id, fileType: 'PROFILE' },
    })

    return {
      ...user,
      imageUrl: getS3ImageUrl(
        userImage?.path,
        this.configService.get('file.awsDefaultS3Bucket'),
      ),
    }
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.db.user.findMany({
      where: { id: { in: ids } },
    })
  }

  findByUsername(username: string): Promise<NullableType<User>> {
    return this.db.user.findUnique({
      where: { username },
    })
  }

  async update(
    id: User['id'],
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    // Do not remove comment below.
    // <updating-property />

    let password: string | undefined = undefined

    if (updateUserDto.password) {
      const userObject = await this.findById(id)

      if (userObject && userObject?.password !== updateUserDto.password) {
        const salt = await bcrypt.genSalt()
        password = await bcrypt.hash(updateUserDto.password, salt)
      }
    }

    // let imageId: string | null | undefined = undefined

    // if (updateUserDto.imageId) {
    //   const fileObject = await this.filesService.findById(updateUserDto.imageId)
    //   if (!fileObject) {
    //     throw new ApiUnprocessableEntityException('imageNotExists')
    //   }
    //   imageId = fileObject.id
    // } else if (updateUserDto.imageId === null) {
    //   imageId = null
    // }

    return this.db.user.update({
      where: { id },
      // Do not remove comment below.
      // <updating-property-payload />
      data: {
        password: password,
        emailVerified: updateUserDto.emailVerified,
      },
    })
  }
}
