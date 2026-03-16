import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { EventsCrudService } from './services/events-crud.service';
import { EventsGeoService } from './services/events-geo.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { EventResponse } from './events.types';

/**
 * Service orchestrateur des événements.
 * Délègue les opérations CRUD à EventsCrudService
 * et les requêtes géospatiales à EventsGeoService.
 */
@Injectable()
export class EventsService {
  constructor(
    private readonly crud: EventsCrudService,
    private readonly geo: EventsGeoService,
  ) {}

  /** @see EventsGeoService.findNearby */
  findNearby(userId: string, dto: FindNearbyDto): Promise<EventResponse[]> {
    return this.geo.findNearby(userId, dto);
  }

  /** @see EventsCrudService.create */
  create(userId: string, dto: CreateEventDto): Promise<EventResponse> {
    return this.crud.create(userId, dto);
  }

  /** @see EventsCrudService.findById */
  findById(id: string): Promise<EventResponse> {
    return this.crud.findById(id);
  }

  /** @see EventsCrudService.update */
  update(userId: string, id: string, dto: UpdateEventDto, role: Role): Promise<EventResponse> {
    return this.crud.update(userId, id, dto, role);
  }

  /** @see EventsCrudService.remove */
  remove(userId: string, id: string, role: Role): Promise<void> {
    return this.crud.remove(userId, id, role);
  }
}
