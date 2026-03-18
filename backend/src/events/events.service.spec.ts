/**
 * Tests unitaires — EventsService
 * Vérifie la délégation vers EventsCrudService et EventsGeoService.
 * Les sous-services sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { EventsCrudService } from './services/events-crud.service';
import { EventsGeoService } from './services/events-geo.service';
import { EventsGateway } from './events.gateway';
import { EventResponse } from './events.types';

const mockEvent: EventResponse = {
  id: 'evt-1', title: 'Test', description: null, imageUrl: null, address: null,
  lat: 48.85, lng: 2.35, capacity: 10, participantCount: 0, isParticipant: false,
  visibility: 'PUBLIC', category: 'OTHER',
  startAt: new Date(), endAt: new Date(),
  creatorId: 'user-1', createdAt: new Date(),
};

const mockCrud = {
  create: jest.fn(), findById: jest.fn(),
  update: jest.fn(), remove: jest.fn(),
};
const mockGeo = { findAll: jest.fn(), findNearby: jest.fn() };
const mockGateway = { emitCreated: jest.fn(), emitUpdated: jest.fn(), emitDeleted: jest.fn() };

let service: EventsService;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventsCrudService, useValue: mockCrud },
        { provide: EventsGeoService, useValue: mockGeo },
        { provide: EventsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    jest.clearAllMocks();
  });
}

function describeCreate() {
  describe('create', () => {
    it('should delegate to EventsCrudService.create and emit', async () => {
      mockCrud.create.mockResolvedValue(mockEvent);
      const dto = { title: 'Test', lat: 48.85, lng: 2.35, capacity: 10, startAt: new Date(), endAt: new Date() };

      const result = await service.create('user-1', dto as any);

      expect(mockCrud.create).toHaveBeenCalledWith('user-1', dto);
      expect(mockGateway.emitCreated).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });
  });
}

function describeFindNearby() {
  describe('findNearby', () => {
    it('should delegate to EventsGeoService.findNearby', async () => {
      mockGeo.findNearby.mockResolvedValue([mockEvent]);
      const dto = { lat: 48.85, lng: 2.35 };

      const result = await service.findNearby('user-1', dto as any);

      expect(mockGeo.findNearby).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual([mockEvent]);
    });
  });
}

function describeRemove() {
  describe('remove', () => {
    it('should delegate to EventsCrudService.remove and emit', async () => {
      mockCrud.remove.mockResolvedValue(undefined);

      await service.remove('user-1', 'evt-1', 'USER');

      expect(mockCrud.remove).toHaveBeenCalledWith('user-1', 'evt-1', 'USER');
      expect(mockGateway.emitDeleted).toHaveBeenCalledWith('evt-1');
    });
  });
}

describe('EventsService', () => {
  setupBeforeEach();
  describeCreate();
  describeFindNearby();
  describeRemove();
});
