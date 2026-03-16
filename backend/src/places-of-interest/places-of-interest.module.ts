import { Module } from '@nestjs/common';
import { PlacesOfInterestController } from './places-of-interest.controller';
import { PlacesOfInterestService } from './places-of-interest.service';

@Module({
  controllers: [PlacesOfInterestController],
  providers: [PlacesOfInterestService],
  exports: [PlacesOfInterestService],
})
export class PlacesOfInterestModule {}
