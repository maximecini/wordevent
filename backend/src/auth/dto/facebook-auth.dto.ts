import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FacebookAuthDto {
  @ApiProperty({ description: "Access token Facebook obtenu via Expo Auth Session" })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
