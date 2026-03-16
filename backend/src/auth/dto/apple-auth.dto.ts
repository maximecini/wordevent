import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class AppleAuthDto {
  @ApiProperty({ description: 'Identity token obtenu via Expo Apple Sign In' })
  @IsString()
  identityToken: string;

  @ApiProperty({ description: 'Nom complet (seulement au premier login Apple)', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}
