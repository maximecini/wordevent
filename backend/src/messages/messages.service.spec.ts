import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { DatabaseService } from '../database/database.service';

const EVENT_ID = 'event-uuid';
const USER_ID = 'user-uuid';

let service: MessagesService;
let dbQuery: jest.Mock;

const baseMessageRow = {
  id: 'msg-uuid',
  content: 'Bonjour',
  eventId: EVENT_ID,
  senderId: USER_ID,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  senderName: 'Alice',
  senderAvatar: null,
};

function mockEventFound() {
  dbQuery.mockResolvedValueOnce([{ id: EVENT_ID }]);
}

function mockCreatorCheck(creatorId = 'other-user') {
  dbQuery.mockResolvedValueOnce([{ creatorId }]);
}

function mockParticipantFound() {
  dbQuery.mockResolvedValueOnce([{ 1: 1 }]);
}

function mockParticipantNotFound() {
  dbQuery.mockResolvedValueOnce([]);
}

function setupBeforeEach() {
  beforeEach(async () => {
    dbQuery = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: DatabaseService, useValue: { query: dbQuery, execute: jest.fn() } },
      ],
    }).compile();

    service = module.get(MessagesService);
  });
}

function describeGetHistory() {
  describe('getHistory', () => {
    it('should return formatted messages when user is participant', async () => {
      mockEventFound();
      mockCreatorCheck('other-user');
      mockParticipantFound();
      dbQuery.mockResolvedValueOnce([baseMessageRow]);

      const result = await service.getHistory(EVENT_ID, USER_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'msg-uuid',
        content: 'Bonjour',
        senderName: 'Alice',
        senderAvatar: null,
      });
    });

    it('should return formatted messages when user is creator', async () => {
      mockEventFound();
      mockCreatorCheck(USER_ID);
      dbQuery.mockResolvedValueOnce([baseMessageRow]);

      const result = await service.getHistory(EVENT_ID, USER_ID);

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if event not found', async () => {
      dbQuery.mockResolvedValueOnce([]);

      await expect(service.getHistory(EVENT_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      mockEventFound();
      mockCreatorCheck('other-user');
      mockParticipantNotFound();

      await expect(service.getHistory(EVENT_ID, USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should pass cursor to query when provided', async () => {
      const cursor = '2024-01-01T00:00:00.000Z';
      mockEventFound();
      mockCreatorCheck('other-user');
      mockParticipantFound();
      dbQuery.mockResolvedValueOnce([]);

      await service.getHistory(EVENT_ID, USER_ID, 10, cursor);

      const lastCall = dbQuery.mock.calls.at(-1);
      expect(lastCall[0]).toContain('created_at < $3');
      expect(lastCall[1]).toContain(cursor);
    });
  });
}

function describeSaveMessage() {
  describe('saveMessage', () => {
    it('should save and return formatted message', async () => {
      mockEventFound();
      mockCreatorCheck('other-user');
      mockParticipantFound();
      dbQuery.mockResolvedValueOnce([baseMessageRow]);

      const result = await service.saveMessage(EVENT_ID, USER_ID, 'Bonjour');

      expect(result).toMatchObject({ content: 'Bonjour', senderName: 'Alice' });
    });

    it('should throw NotFoundException if event not found', async () => {
      dbQuery.mockResolvedValueOnce([]);

      await expect(service.saveMessage(EVENT_ID, USER_ID, 'Bonjour')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      mockEventFound();
      mockCreatorCheck('other-user');
      mockParticipantNotFound();

      await expect(service.saveMessage(EVENT_ID, USER_ID, 'Bonjour')).rejects.toThrow(ForbiddenException);
    });
  });
}

describe('MessagesService', () => {
  setupBeforeEach();
  describeGetHistory();
  describeSaveMessage();
});
