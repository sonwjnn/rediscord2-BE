import { Module } from '@nestjs/common'
import { ReplicateService } from './replicate.service'
import { ReplicateController } from './replicate.controller'

@Module({
  controllers: [ReplicateController],
  providers: [ReplicateService],
  exports: [ReplicateService],
})
export class ReplicateModule {}
