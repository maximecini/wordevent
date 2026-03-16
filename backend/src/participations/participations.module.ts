import { Module } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { ParticipationsController } from './participations.controller';
import { EventsModule } from '../events/events.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [EventsModule, MessagesModule],
  controllers: [ParticipationsController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
