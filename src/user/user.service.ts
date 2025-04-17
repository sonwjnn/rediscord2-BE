import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
  HttpStatus,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  AuthProvidersEnum,
  CleaningDelay,
  Statuses,
  User,
} from '@prisma/client'
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto } from './dto'
import * as bcrypt from 'bcryptjs'
import { NullableType } from '@/utils/types/nullable.type'

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

  findByEmail(email: string): Promise<NullableType<User>> {
    return this.db.user.findUnique({
      where: { email },
    })
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

    let cleaningDelay: CleaningDelay | undefined = undefined

    if (updateUserDto.cleaningDelay) {
      const roleObject = Object.values(CleaningDelay)
        .map(String)
        .includes(String(updateUserDto.cleaningDelay))
      if (!roleObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            role: 'roleNotExists',
          },
        })
      }

      cleaningDelay = updateUserDto.cleaningDelay
    }

    let status: Statuses | undefined = undefined

    if (updateUserDto.status) {
      const statusObject = Object.values(Statuses)
        .map(String)
        .includes(String(updateUserDto.status))
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        })
      }

      status = updateUserDto.status
    }

    return this.db.user.update({
      where: { id },
      // Do not remove comment below.
      // <updating-property-payload />
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        password: password,
        image: updateUserDto.image,
        emailVerified: updateUserDto.emailVerified,
        status: status,
      },
    })
  }
}
