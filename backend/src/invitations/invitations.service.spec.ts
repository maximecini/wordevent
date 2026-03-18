/**
 * Tests unitaires — InvitationsService
 * Vérifie la logique d'invitation : créer, lister, répondre.
 * DatabaseService et EventsGateway sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { InvitationsService } from './invitations.service';
import { DatabaseService } from '../database/database.service';
import { EventsGateway } from '../events/events.gateway';

const mockPrivateEvent = { id: 'evt-1', visibility: 'PRIVATE', creatorId: 'creator-1' };
const mockPublicEvent = { id: 'evt-2', visibility: 'PUBLIC', creatorId: 'creator-1' };
const mockInvitation = {
  id: 'inv-1',
  status: 'PENDING',
  eventId: 'evt-1',
  invitedUserId: 'user-2',
  invitedById: 'creator-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

let service: InvitationsService;
let dbQuery: jest.Mock;
const mockGateway = { emitInvitation: jest.fn() };

function setupBeforeEach() {
  beforeEach(async () => {
    dbQuery = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: DatabaseService, useValue: { query: dbQuery, execute: jest.fn() } },
        { provide: EventsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    jest.clearAllMocks();
    dbQuery = module.get(DatabaseService).query as jest.Mock;
  });
}

function describeCreateSuccess() {
  describe('create - succès', () => {
    it('should create invitation and emit socket event', async () => {
      dbQuery.mockResolvedValueOnce([mockPrivateEvent]);
      dbQuery.mockResolvedValueOnce([{ id: 'user-2' }]);
      dbQuery.mockResolvedValueOnce([mockInvitation]);

      await service.create('evt-1', 'user-2', 'creator-1');

      expect(dbQuery).toHaveBeenCalledTimes(3);
      expect(mockGateway.emitInvitation).toHaveBeenCalledWith('user-2', mockInvitation);
    });
  });
}

function describeCreateErrors() {
  describe('create - erreurs', () => {
    it('should throw NotFoundException if event not found', async () => {
      dbQuery.mockResolvedValueOnce([]);

      await expect(service.create('bad', 'user-2', 'creator-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if event is PUBLIC', async () => {
      dbQuery.mockResolvedValueOnce([mockPublicEvent]);

      await expect(service.create('evt-2', 'user-2', 'creator-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if not creator', async () => {
      dbQuery.mockResolvedValueOnce([mockPrivateEvent]);

      await expect(service.create('evt-1', 'user-2', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException on unique violation (code 23505)', async () => {
      dbQuery.mockResolvedValueOnce([mockPrivateEvent]);
      const pgError = Object.assign(new DatabaseError('unique violation', 0, 'error'), { code: '23505' });
      dbQuery.mockRejectedValueOnce(pgError);

      await expect(service.create('evt-1', 'user-2', 'creator-1')).rejects.toThrow(ConflictException);
    });
  });
}

function describeCreateErrorsExtra() {
  describe('create - erreurs (validations)', () => {
    it('should throw BadRequestException if invitedUserId equals inviterId', async () => {
      dbQuery.mockResolvedValueOnce([mockPrivateEvent]);

      await expect(service.create('evt-1', 'creator-1', 'creator-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if invitedUserId does not exist in DB', async () => {
      dbQuery.mockResolvedValueOnce([mockPrivateEvent]);
      dbQuery.mockResolvedValueOnce([]);

      await expect(service.create('evt-1', 'unknown-user', 'creator-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException on FK violation code 23503', async () => {
      dbQuery.mockResolvedValueOnce([mockPrivateEvent]);
      dbQuery.mockResolvedValueOnce([{ id: 'unknown-user' }]);
      const pgError = Object.assign(new DatabaseError('fk violation', 0, 'error'), { code: '23503' });
      dbQuery.mockRejectedValueOnce(pgError);

      await expect(service.create('evt-1', 'unknown-user', 'creator-1')).rejects.toThrow(NotFoundException);
    });
  });
}

function describeFindAllPending() {
  describe('findAllPending', () => {
    it('should return pending invitations for user', async () => {
      dbQuery.mockResolvedValueOnce([mockInvitation]);

      const result = await service.findAllPending('user-2');

      expect(result).toEqual([mockInvitation]);
      const sql: string = dbQuery.mock.calls[0][0];
      expect(sql).toContain("status = 'PENDING'");
      expect(dbQuery.mock.calls[0][1]).toEqual(['user-2']);
    });
  });
}

function describeUpdateStatusSuccess() {
  describe('updateStatus - succès', () => {
    it('should update status to ACCEPTED', async () => {
      dbQuery.mockResolvedValueOnce([mockInvitation]);
      dbQuery.mockResolvedValueOnce([{ ...mockInvitation, status: 'ACCEPTED' }]);

      const result = await service.updateStatus('inv-1', 'ACCEPTED', 'user-2');

      expect(result.status).toBe('ACCEPTED');
    });
  });
}

function describeUpdateStatusErrors() {
  describe('updateStatus - erreurs', () => {
    it('should throw NotFoundException if invitation not found', async () => {
      dbQuery.mockResolvedValueOnce([]);

      await expect(service.updateStatus('bad', 'ACCEPTED', 'user-2')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the invitee', async () => {
      dbQuery.mockResolvedValueOnce([mockInvitation]);

      await expect(service.updateStatus('inv-1', 'ACCEPTED', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if invitation is not PENDING', async () => {
      dbQuery.mockResolvedValueOnce([{ ...mockInvitation, status: 'ACCEPTED' }]);

      await expect(service.updateStatus('inv-1', 'DECLINED', 'user-2')).rejects.toThrow(BadRequestException);
    });
  });
}

describe('InvitationsService', () => {
  setupBeforeEach();
  describeCreateSuccess();
  describeCreateErrors();
  describeCreateErrorsExtra();
  describeFindAllPending();
  describeUpdateStatusSuccess();
  describeUpdateStatusErrors();
});
