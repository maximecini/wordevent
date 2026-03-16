import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePlaceDto {
  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsString() @IsOptional()
  icon?: string;

  @ApiProperty({ required: false, description: 'Latitude WGS84' })
  @IsNumber() @IsOptional()
  lat?: number;

  @ApiProperty({ required: false, description: 'Longitude WGS84' })
  @IsNumber() @IsOptional()
  lng?: number;
}
