import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  content: string;
}
