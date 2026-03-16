import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdateInvitationDto {
  @ApiProperty({ enum: ['ACCEPTED', 'DECLINED'], description: 'Réponse à l\'invitation' })
  @IsIn(['ACCEPTED', 'DECLINED'])
  status: 'ACCEPTED' | 'DECLINED';
}
