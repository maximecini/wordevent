/**
 * Tests unitaires — EventsController
 * Vérifie la délégation vers EventsService pour chaque endpoint.
 * EventsService est mocké.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { FindNearbyDto } from './dto/find-nearby.dto';
import { EventResponse } from './events.types';
import { JwtUser } from '../common/types/jwt-user.interface';

const mockEvent: EventResponse = {
  id: 'evt-1', title: 'Test', description: null, imageUrl: null, address: null,
  lat: 48.85, lng: 2.35, capacity: 10, participantCount: 2, isParticipant: false,
  visibility: 'PUBLIC', category: 'OTHER',
  startAt: new Date(), endAt: new Date(),
  creatorId: 'user-1', createdAt: new Date(),
};

const mockUser = { id: 'user-1', role: 'USER' } as JwtUser;

const mockEventsService = {
  findAll: jest.fn(),
  findNearby: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

let controller: EventsController;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [{ provide: EventsService, useValue: mockEventsService }],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });
}

function describeFindNearby() {
  describe('findNearby', () => {
    it('should call EventsService.findNearby with userId and dto', async () => {
      mockEventsService.findNearby.mockResolvedValue([mockEvent]);
      const dto: FindNearbyDto = { lat: 48.85, lng: 2.35, radius: 3000 };

      const result = await controller.findNearby(mockUser, dto);

      expect(mockEventsService.findNearby).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual([mockEvent]);
    });

    it('should call EventsService.findNearby without radius (rayon par défaut)', async () => {
      mockEventsService.findNearby.mockResolvedValue([]);
      const dto: FindNearbyDto = { lat: 48.85, lng: 2.35 };

      const result = await controller.findNearby(mockUser, dto);

      expect(mockEventsService.findNearby).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual([]);
    });

    it("should retourner un tableau vide si aucun événement n'est trouvé", async () => {
      mockEventsService.findNearby.mockResolvedValue([]);
      const dto: FindNearbyDto = { lat: 0, lng: 0, radius: 100 };

      const result = await controller.findNearby(mockUser, dto);

      expect(result).toEqual([]);
    });
  });
}

function describeFindAll() {
  describe('findAll', () => {
    it('should call EventsService.findAll with userId', async () => {
      mockEventsService.findAll.mockResolvedValue([mockEvent]);

      const result = await controller.findAll(mockUser);

      expect(mockEventsService.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([mockEvent]);
    });
  });
}

describe('EventsController', () => {
  setupBeforeEach();
  describeFindAll();
  describeFindNearby();
});
