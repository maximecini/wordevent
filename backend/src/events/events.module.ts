import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsCrudService } from './services/events-crud.service';
import { EventsGeoService } from './services/events-geo.service';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsCrudService, EventsGeoService, EventsGateway],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {}
