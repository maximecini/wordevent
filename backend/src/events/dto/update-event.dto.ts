import { ApiProperty } from '@nestjs/swagger';
import { EventVisibility } from '../../common/types/enums';
import { Type } from 'class-transformer';
import {
  IsString, IsOptional, IsNumber,
  IsInt, Min, IsEnum, IsDate,
} from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional()
  title?: string;

  @ApiProperty({ required: false }) @IsString() @IsOptional()
  address?: string;

  @ApiProperty({ required: false }) @IsString() @IsOptional()
  description?: string;

  @ApiProperty({ required: false }) @IsNumber() @IsOptional()
  lat?: number;

  @ApiProperty({ required: false }) @IsNumber() @IsOptional()
  lng?: number;

  @ApiProperty({ required: false }) @IsInt() @Min(1) @IsOptional()
  capacity?: number;

  @ApiProperty({ enum: EventVisibility, required: false })
  @IsEnum(EventVisibility) @IsOptional()
  visibility?: EventVisibility;

  @ApiProperty({ required: false }) @Type(() => Date) @IsDate() @IsOptional()
  startAt?: Date;

  @ApiProperty({ required: false }) @Type(() => Date) @IsDate() @IsOptional()
  endAt?: Date;
}
