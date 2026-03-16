import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class FindNearbyPlacesDto {
  @ApiProperty({ description: 'Latitude du centre de recherche' })
  @Type(() => Number) @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude du centre de recherche' })
  @Type(() => Number) @IsNumber()
  lng: number;

  @ApiProperty({ description: 'Rayon en mètres', default: 5000 })
  @Type(() => Number) @IsNumber() @Min(1) @IsOptional()
  radius?: number;
}
