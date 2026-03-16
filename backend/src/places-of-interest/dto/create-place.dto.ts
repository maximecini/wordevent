import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({ description: 'Nom du point d\'intérêt' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, description: 'Description optionnelle' })
  @IsString() @IsOptional()
  description?: string;

  @ApiProperty({ required: false, description: 'Emoji ou identifiant icône (ex: ☕ 🏠)' })
  @IsString() @IsOptional()
  icon?: string;

  @ApiProperty({ description: 'Latitude WGS84' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude WGS84' })
  @IsNumber()
  lng: number;
}
