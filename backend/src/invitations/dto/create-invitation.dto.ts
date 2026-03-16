import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({ description: "UUID de l'utilisateur à inviter" })
  @IsUUID()
  @IsNotEmpty()
  invitedUserId: string;
}
