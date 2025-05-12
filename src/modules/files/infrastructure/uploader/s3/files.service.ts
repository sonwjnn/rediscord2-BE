// import { Injectable } from '@nestjs/common'
// import { FileType } from '@/modules/files/domain/file'
// import { PrismaService } from '@/modules/prisma'
// import { ApiUnprocessableEntityException } from '@/utils/exception'

// @Injectable()
// export class FilesS3Service {
//   constructor(private readonly db: PrismaService) {}

//   async create(file: Express.MulterS3.File): Promise<{ file: FileType }> {
//     if (!file) {
//       throw new ApiUnprocessableEntityException('selectFile')
//     }

//     return {
//       file: await this.db.file.create({
//         data: {
//           path: file.key,
//         },
//       }),
//     }
//   }
// }
