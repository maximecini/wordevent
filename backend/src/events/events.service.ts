import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { EventsCrudService } from './services/events-crud.service';
import { EventsGeoService } from './services/events-geo.service';
import { EventsGateway } from './events.gateway';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { EventResponse } from './events.types';

/**
 * Service orchestrateur des événements.
 * Délègue les opérations CRUD à EventsCrudService,
 * les requêtes géospatiales à EventsGeoService
 * et émet les événements temps réel via EventsGateway.
 */
@Injectable()
export class EventsService {
  constructor(
    private readonly crud: EventsCrudService,
    private readonly geo: EventsGeoService,
    private readonly gateway: EventsGateway,
  ) {}

  /** @see EventsGeoService.findNearby */
  findNearby(userId: string, dto: FindNearbyDto): Promise<EventResponse[]> {
    return this.geo.findNearby(userId, dto);
  }

  /**
   * Crée un événement et diffuse l'événement à tous les clients connectés.
   * @see EventsCrudService.create
   */
  async create(userId: string, dto: CreateEventDto): Promise<EventResponse> {
    const event = await this.crud.create(userId, dto);
    this.gateway.emitCreated(event);
    return event;
  }

  /** @see EventsCrudService.findById */
  findById(id: string): Promise<EventResponse> {
    return this.crud.findById(id);
  }

  /**
   * Met à jour un événement et notifie la room.
   * @see EventsCrudService.update
   */
  async update(userId: string, id: string, dto: UpdateEventDto, role: Role): Promise<EventResponse> {
    const event = await this.crud.update(userId, id, dto, role);
    this.gateway.emitUpdated(event);
    return event;
  }

  /**
   * Supprime un événement et notifie la room.
   * @see EventsCrudService.remove
   */
  async remove(userId: string, id: string, role: Role): Promise<void> {
    await this.crud.remove(userId, id, role);
    this.gateway.emitDeleted(id);
  }
}
