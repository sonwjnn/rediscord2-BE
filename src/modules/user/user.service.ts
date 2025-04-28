import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/modules/prisma/prisma.service'
import { User } from '@prisma/client'
import { CreateUserDto, UpdateUserDto } from './dto'
import * as bcrypt from 'bcryptjs'
import { NullableType } from '@/utils/types/nullable.type'
import { ApiConflictException } from '@/utils/exception'

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
        throw new ApiConflictException('emailExists')
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
        throw new ApiConflictException('nameExists')
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
            name: usernameOrEmail,
          },
        ],
      },
    })
  }

  findById(id: User['id']): Promise<NullableType<User>> {
    return this.db.user.findUnique({
      where: { id },
    })
  }

  findByIds(ids: User['id'][]): Promise<User[]> {
    return this.db.user.findMany({
      where: { id: { in: ids } },
    })
  }

  findByName(name: string): Promise<NullableType<User>> {
    return this.db.user.findUnique({
      where: { name },
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

    // let photo: FileType | null | undefined = undefined;

    // if (updateUserDto.photo?.id) {
    //   const fileObject = await this.filesService.findById(
    //     updateUserDto.photo.id,
    //   );
    //   if (!fileObject) {
    //     throw new UnprocessableEntityException({
    //       status: HttpStatus.UNPROCESSABLE_ENTITY,
    //       errors: {
    //         photo: 'imageNotExists',
    //       },
    //     });
    //   }
    //   photo = fileObject;
    // } else if (updateUserDto.photo === null) {
    //   photo = null;
    // }

    return this.db.user.update({
      where: { id },
      // Do not remove comment below.
      // <updating-property-payload />
      data: {
        password: password,
        image: updateUserDto.image,
        emailVerified: updateUserDto.emailVerified,
      },
    })
  }
}
