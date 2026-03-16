/**
 * Tests unitaires — InvitationsService
 * Vérifie la logique d'invitation : créer, lister, répondre.
 * PrismaService et EventsGateway sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

const mockPrivateEvent = { id: 'evt-1', visibility: 'PRIVATE', creatorId: 'creator-1' };
const mockPublicEvent = { id: 'evt-2', visibility: 'PUBLIC', creatorId: 'creator-1' };
const mockInvitation = { id: 'inv-1', eventId: 'evt-1', invitedUserId: 'user-2', invitedById: 'creator-1' };

const mockPrisma = {
  event: { findUnique: jest.fn() },
  invitation: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
};
const mockGateway = { emitInvitation: jest.fn() };

let service: InvitationsService;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EventsGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    jest.clearAllMocks();
  });
}

function describeCreate() {
  describe('create - succès', () => {
    it('should create invitation and emit socket event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPrivateEvent);
      mockPrisma.invitation.findUnique.mockResolvedValue(null);
      mockPrisma.invitation.create.mockResolvedValue(mockInvitation);

      await service.create('evt-1', 'user-2', 'creator-1');
      expect(mockPrisma.invitation.create).toHaveBeenCalled();
      expect(mockGateway.emitInvitation).toHaveBeenCalledWith('user-2', mockInvitation);
    });
  });

  describe('create - erreurs', () => {
    it('should throw NotFoundException if event not found', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      await expect(service.create('bad', 'user-2', 'creator-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if event is PUBLIC', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPublicEvent);
      await expect(service.create('evt-2', 'user-2', 'creator-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if not creator', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPrivateEvent);
      await expect(service.create('evt-1', 'user-2', 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already invited', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPrivateEvent);
      mockPrisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      await expect(service.create('evt-1', 'user-2', 'creator-1')).rejects.toThrow(BadRequestException);
    });
  });
}

function describeFindAllPending() {
  describe('findAllPending', () => {
    it('should return pending invitations for user', async () => {
      mockPrisma.invitation.findMany.mockResolvedValue([mockInvitation]);
      const result = await service.findAllPending('user-2');
      expect(result).toEqual([mockInvitation]);
      expect(mockPrisma.invitation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { invitedUserId: 'user-2', status: 'PENDING' } }),
      );
    });
  });
}

function describeUpdateStatus() {
  describe('updateStatus - succès', () => {
    it('should update status to ACCEPTED', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      mockPrisma.invitation.update.mockResolvedValue({ ...mockInvitation, status: 'ACCEPTED' });
      const result = await service.updateStatus('inv-1', 'ACCEPTED', 'user-2');
      expect(result.status).toBe('ACCEPTED');
    });
  });

  describe('updateStatus - erreurs', () => {
    it('should throw NotFoundException if invitation not found', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(null);
      await expect(service.updateStatus('bad', 'ACCEPTED', 'user-2')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not the invitee', async () => {
      mockPrisma.invitation.findUnique.mockResolvedValue(mockInvitation);
      await expect(service.updateStatus('inv-1', 'ACCEPTED', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
}

describe('InvitationsService', () => {
  setupBeforeEach();
  describeCreate();
  describeFindAllPending();
  describeUpdateStatus();
});
