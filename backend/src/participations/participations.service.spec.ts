/**
 * Tests unitaires — ParticipationsService
 * Vérifie la logique de participation : rejoindre, quitter, liste.
 * PrismaService est mocké.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPublicEvent = { id: 'evt-1', capacity: 2, visibility: 'PUBLIC', creatorId: 'creator-1' };
const mockPrivateEvent = { id: 'evt-2', capacity: 2, visibility: 'PRIVATE', creatorId: 'creator-1' };

const mockPrisma = {
  event: { findUnique: jest.fn() },
  participation: { create: jest.fn(), count: jest.fn(), delete: jest.fn(), findMany: jest.fn() },
  invitation: { findFirst: jest.fn() },
};

let service: ParticipationsService;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ParticipationsService>(ParticipationsService);
    jest.clearAllMocks();
  });
}

function describeJoin() {
  describe('join - succès', () => {
    /** Crée une participation si toutes les conditions sont remplies */
    it('should create participation for valid public event', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPublicEvent);
      mockPrisma.participation.count.mockResolvedValue(0);
      mockPrisma.participation.create.mockResolvedValue({});

      await service.join('user-1', 'evt-1');
      expect(mockPrisma.participation.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', eventId: 'evt-1' },
      });
    });
  });

  describe('join - erreurs', () => {
    /** Lève NotFoundException si l'event n'existe pas */
    it('should throw NotFoundException if event not found', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);
      await expect(service.join('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });

    /** Lève BadRequestException si la capacité est atteinte */
    it('should throw BadRequestException if event is full', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPublicEvent);
      mockPrisma.participation.count.mockResolvedValue(2);
      await expect(service.join('user-1', 'evt-1')).rejects.toThrow(BadRequestException);
    });

    /** Lève ForbiddenException si event PRIVATE sans invitation */
    it('should throw ForbiddenException for private event without invitation', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPrivateEvent);
      mockPrisma.invitation.findFirst.mockResolvedValue(null);
      await expect(service.join('user-1', 'evt-2')).rejects.toThrow(ForbiddenException);
    });
  });
}

function describeLeave() {
  describe('leave', () => {
    /** Supprime la participation si l'utilisateur n'est pas le créateur */
    it('should delete participation for non-creator', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPublicEvent);
      mockPrisma.participation.delete.mockResolvedValue({});

      await service.leave('user-1', 'evt-1');
      expect(mockPrisma.participation.delete).toHaveBeenCalled();
    });

    /** Lève ForbiddenException si le créateur tente de quitter */
    it('should throw ForbiddenException if creator tries to leave', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(mockPublicEvent);
      await expect(service.leave('creator-1', 'evt-1')).rejects.toThrow(ForbiddenException);
    });
  });
}

describe('ParticipationsService', () => {
  setupBeforeEach();
  describeJoin();
  describeLeave();
});
