import { ApiProperty } from '@nestjs/swagger';
import { EventCategory, EventVisibility } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString, IsNotEmpty, IsOptional, IsNumber,
  IsInt, Min, IsEnum, IsDate,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty() @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false }) @IsString() @IsOptional()
  description?: string;

  @ApiProperty() @IsNumber() lat: number;
  @ApiProperty() @IsNumber() lng: number;

  @ApiProperty() @IsInt() @Min(1)
  capacity: number;

  @ApiProperty({ enum: EventVisibility, default: EventVisibility.PUBLIC })
  @IsEnum(EventVisibility) @IsOptional()
  visibility?: EventVisibility;

  @ApiProperty({ enum: EventCategory, default: EventCategory.OTHER })
  @IsEnum(EventCategory) @IsOptional()
  category?: EventCategory;

  @ApiProperty() @Type(() => Date) @IsDate()
  startAt: Date;

  @ApiProperty() @Type(() => Date) @IsDate()
  endAt: Date;
}
