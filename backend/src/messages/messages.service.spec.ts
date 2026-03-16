import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';

const EVENT_ID = 'event-uuid';
const USER_ID = 'user-uuid';
const SENDER = { id: USER_ID, name: 'Alice', avatar: null };

let service: MessagesService;
let prisma: { event: jest.Mocked<any>; participation: jest.Mocked<any>; message: jest.Mocked<any> };

function mockEventFound() {
  prisma.event.findUnique.mockResolvedValue({ id: EVENT_ID });
}

function mockParticipantFound() {
  prisma.participation.findUnique.mockResolvedValue({ userId: USER_ID, eventId: EVENT_ID });
}

function mockMessage(overrides: object = {}) {
  return {
    id: 'msg-uuid',
    content: 'Bonjour',
    eventId: EVENT_ID,
    senderId: USER_ID,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    sender: SENDER,
    ...overrides,
  };
}

function setupBeforeEach() {
  beforeEach(async () => {
    prisma = {
      event: { findUnique: jest.fn() },
      participation: { findUnique: jest.fn() },
      message: { findMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(MessagesService);
  });
}

function describeGetHistory() {
  describe('getHistory', () => {
    it('should return formatted messages when user is participant', async () => {
      mockEventFound();
      mockParticipantFound();
      prisma.message.findMany.mockResolvedValue([mockMessage()]);

      const result = await service.getHistory(EVENT_ID, USER_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'msg-uuid',
        content: 'Bonjour',
        senderName: 'Alice',
        senderAvatar: null,
      });
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.getHistory(EVENT_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      mockEventFound();
      prisma.participation.findUnique.mockResolvedValue(null);

      await expect(service.getHistory(EVENT_ID, USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should pass cursor to prisma query', async () => {
      mockEventFound();
      mockParticipantFound();
      prisma.message.findMany.mockResolvedValue([]);

      const cursor = '2024-01-01T00:00:00.000Z';
      await service.getHistory(EVENT_ID, USER_ID, 10, cursor);

      expect(prisma.message.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { eventId: EVENT_ID, createdAt: { lt: new Date(cursor) } },
          take: 10,
        }),
      );
    });
  });
}

function describeSaveMessage() {
  describe('saveMessage', () => {
    it('should save and return formatted message', async () => {
      mockEventFound();
      mockParticipantFound();
      prisma.message.create.mockResolvedValue(mockMessage());

      const result = await service.saveMessage(EVENT_ID, USER_ID, 'Bonjour');

      expect(result).toMatchObject({ content: 'Bonjour', senderName: 'Alice' });
      expect(prisma.message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { eventId: EVENT_ID, senderId: USER_ID, content: 'Bonjour' },
        }),
      );
    });

    it('should throw NotFoundException if event not found', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(service.saveMessage(EVENT_ID, USER_ID, 'Bonjour')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      mockEventFound();
      prisma.participation.findUnique.mockResolvedValue(null);

      await expect(service.saveMessage(EVENT_ID, USER_ID, 'Bonjour')).rejects.toThrow(ForbiddenException);
    });
  });
}

describe('MessagesService', () => {
  setupBeforeEach();
  describeGetHistory();
  describeSaveMessage();
});
