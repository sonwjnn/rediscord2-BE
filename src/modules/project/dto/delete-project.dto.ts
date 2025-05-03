import { IsString } from 'class-validator'

export class DeleteProjectDto {
  @IsString()
  id: string
}
