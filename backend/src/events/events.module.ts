import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsCrudService } from './services/events-crud.service';
import { EventsGeoService } from './services/events-geo.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsCrudService, EventsGeoService],
  exports: [EventsService],
})
export class EventsModule {}
