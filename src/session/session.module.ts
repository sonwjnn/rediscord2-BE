import {
  // common
  Module,
} from '@nestjs/common';

import { SessionService } from './session.service';
import { PrismaModule } from '@/prisma';


@Module({
  imports: [PrismaModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}