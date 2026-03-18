/**
 * Tests unitaires — ParticipationsService
 * Vérifie la logique de participation : rejoindre, quitter, liste.
 * DatabaseService est mocké.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { ParticipationsService } from './participations.service';
import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';
import { MessagesGateway } from '../messages/messages.gateway';

const mockPublicEvent = { id: 'evt-1', capacity: 2, visibility: 'PUBLIC', creator_id: 'creator-1', active: true };
const mockPrivateEvent = { id: 'evt-2', capacity: 2, visibility: 'PRIVATE', creator_id: 'creator-1', active: true };

const mockDb = { query: jest.fn(), execute: jest.fn(), transaction: jest.fn() };
const mockGateway = { emitJoined: jest.fn(), emitLeft: jest.fn() };
const mockMessagesGateway = { kickFromChat: jest.fn() };

let service: ParticipationsService;

function mockEventFound(event = mockPublicEvent) {
  mockDb.query.mockResolvedValueOnce([event]);
}

function mockEventNotFound() {
  mockDb.query.mockResolvedValueOnce([]);
}

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: EventsGateway, useValue: mockGateway },
        { provide: MessagesGateway, useValue: mockMessagesGateway },
      ],
    }).compile();

    service = module.get<ParticipationsService>(ParticipationsService);
    jest.clearAllMocks();
  });
}

function describeJoinSucces() {
  describe('join - succès', () => {
    it('should create participation for valid public event', async () => {
      mockEventFound();
      mockDb.query.mockResolvedValueOnce([{ count: '0' }]);
      mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockDb.query.mockResolvedValueOnce([{ count: '1' }]);

      await service.join('user-1', 'evt-1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO participations'),
        ['user-1', 'evt-1'],
      );
    });
  });
}

function describeJoinErreurs() {
  describe('join - erreurs', () => {
    it('should throw NotFoundException if event not found', async () => {
      mockEventNotFound();
      await expect(service.join('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is the creator', async () => {
      mockEventFound();
      await expect(service.join('creator-1', 'evt-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if event is full', async () => {
      mockEventFound();
      mockDb.query.mockResolvedValueOnce([{ count: '2' }]);
      await expect(service.join('user-1', 'evt-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for private event without invitation', async () => {
      mockEventFound(mockPrivateEvent);
      mockDb.query.mockResolvedValueOnce([]);
      await expect(service.join('user-1', 'evt-2')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if user already joined (23505)', async () => {
      mockEventFound();
      mockDb.query.mockResolvedValueOnce([{ count: '0' }]);
      const dbError = Object.assign(new DatabaseError('unique violation', 0, 'error'), { code: '23505' });
      mockDb.execute.mockRejectedValueOnce(dbError);
      await expect(service.join('user-1', 'evt-1')).rejects.toThrow(ConflictException);
    });
  });
}

function describeLeave() {
  describe('leave - succès', () => {
    it('should delete participation for non-creator', async () => {
      mockEventFound();
      mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockDb.query.mockResolvedValueOnce([{ count: '0' }]);

      await service.leave('user-1', 'evt-1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM participations'),
        ['user-1', 'evt-1'],
      );
      expect(mockMessagesGateway.kickFromChat).toHaveBeenCalledWith('user-1', 'evt-1');
    });
  });

  describe('leave - erreurs', () => {
    it('should throw NotFoundException if participation not found', async () => {
      mockEventFound();
      mockDb.execute.mockResolvedValueOnce({ rowCount: 0 });
      await expect(service.leave('user-1', 'evt-1')).rejects.toThrow(NotFoundException);
    });
  });
}

function describeLeaveCreateurTransfert() {
  describe('leave - créateur (transfert de lead) - succès', () => {
    it('should transfer creator_id to oldest participant when creator leaves', async () => {
      const mockClient = { query: jest.fn(), execute: jest.fn() };
      mockDb.query.mockResolvedValueOnce([mockPublicEvent]);
      mockDb.transaction.mockImplementation((fn: (c: typeof mockClient) => Promise<void>) => fn(mockClient));
      mockClient.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockClient.query.mockResolvedValueOnce([{ user_id: 'user-2' }]);
      mockClient.execute.mockResolvedValueOnce({ rowCount: 1 });

      await service.leave('creator-1', 'evt-1');

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE events SET creator_id'),
        expect.arrayContaining(['user-2']),
      );
      expect(mockGateway.emitLeft).toHaveBeenCalled();
    });

    it('should deactivate event when no participants remain but messages exist', async () => {
      const mockClient = { query: jest.fn(), execute: jest.fn() };
      mockDb.query.mockResolvedValueOnce([mockPublicEvent]);
      mockDb.transaction.mockImplementation((fn: (c: typeof mockClient) => Promise<void>) => fn(mockClient));
      mockClient.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockClient.query.mockResolvedValueOnce([]);
      mockClient.query.mockResolvedValueOnce([{ '?column?': 1 }]);
      mockClient.execute.mockResolvedValueOnce({ rowCount: 1 });

      await service.leave('creator-1', 'evt-1');

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE events SET active = false'),
        expect.arrayContaining(['evt-1']),
      );
      expect(mockGateway.emitLeft).not.toHaveBeenCalled();
    });

    it('should delete event when no participants remain and no messages', async () => {
      const mockClient = { query: jest.fn(), execute: jest.fn() };
      mockDb.query.mockResolvedValueOnce([mockPublicEvent]);
      mockDb.transaction.mockImplementation((fn: (c: typeof mockClient) => Promise<void>) => fn(mockClient));
      mockClient.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockClient.query.mockResolvedValueOnce([]);
      mockClient.query.mockResolvedValueOnce([]);
      mockClient.execute.mockResolvedValueOnce({ rowCount: 1 });

      await service.leave('creator-1', 'evt-1');

      expect(mockClient.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM events WHERE id'),
        expect.arrayContaining(['evt-1']),
      );
      expect(mockGateway.emitLeft).not.toHaveBeenCalled();
    });
  });
}

function describeLeaveCreateurErreurs() {
  describe('leave - créateur (transfert de lead) - erreurs', () => {
    it('should throw NotFoundException if creator participation not found', async () => {
      const mockClient = { query: jest.fn(), execute: jest.fn() };
      mockDb.query.mockResolvedValueOnce([mockPublicEvent]);
      mockDb.transaction.mockImplementation((fn: (c: typeof mockClient) => Promise<void>) => fn(mockClient));
      mockClient.execute.mockResolvedValueOnce({ rowCount: 0 });

      await expect(service.leave('creator-1', 'evt-1')).rejects.toThrow(NotFoundException);
    });
  });
}

describe('ParticipationsService', () => {
  setupBeforeEach();
  describeJoinSucces();
  describeJoinErreurs();
  describeLeave();
  describeLeaveCreateurTransfert();
  describeLeaveCreateurErreurs();
});
