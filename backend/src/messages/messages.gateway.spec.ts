import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { Socket, Server } from 'socket.io';
import { randomUUID } from 'crypto';

const EVENT_ID = randomUUID();
const USER_ID = randomUUID();
const MESSAGE_RESPONSE = {
  id: 'msg-uuid', content: 'Bonjour', eventId: EVENT_ID,
  senderId: USER_ID, senderName: 'Alice', senderAvatar: null, createdAt: '2024-01-01T00:00:00.000Z',
};

let gateway: MessagesGateway;
let jwtVerifyMock: jest.Mock;
let saveMessageMock: jest.Mock;
let mockServer: { to: jest.Mock; emit?: jest.Mock };
let mockRoom: { emit: jest.Mock };

function makeClient(overrides: Partial<Socket> = {}): Socket {
  return {
    handshake: { auth: { token: 'Bearer valid-token' } },
    data: {},
    disconnect: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    ...overrides,
  } as unknown as Socket;
}

function setupBeforeEach() {
  beforeEach(async () => {
    jwtVerifyMock = jest.fn().mockReturnValue({ sub: USER_ID });
    saveMessageMock = jest.fn().mockResolvedValue(MESSAGE_RESPONSE);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesGateway,
        { provide: JwtService, useValue: { verify: jwtVerifyMock } },
        { provide: MessagesService, useValue: { saveMessage: saveMessageMock } },
      ],
    }).compile();

    gateway = module.get(MessagesGateway);

    mockRoom = { emit: jest.fn() };
    mockServer = { to: jest.fn().mockReturnValue(mockRoom) };
    gateway.server = mockServer as unknown as Server;
  });
}

function describeHandleConnection() {
  describe('handleConnection', () => {
    it('should set userId on valid token', async () => {
      const client = makeClient();
      await gateway.handleConnection(client);
      expect((client.data as any).userId).toBe(USER_ID);
    });

    it('should disconnect if no token', async () => {
      const client = makeClient({ handshake: { auth: {} } } as any);
      await gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should disconnect if token is invalid', async () => {
      jwtVerifyMock.mockImplementation(() => { throw new Error('invalid'); });
      const client = makeClient();
      await gateway.handleConnection(client);
      expect(client.disconnect).toHaveBeenCalled();
    });
  });
}

function describeHandleJoinLeave() {
  describe('chat:join / chat:leave', () => {
    it('should join the room on chat:join', () => {
      const client = makeClient();
      gateway.handleJoinRoom(client, EVENT_ID);
      expect(client.join).toHaveBeenCalledWith(`chat:${EVENT_ID}`);
    });

    it('should leave the room on chat:leave', () => {
      const client = makeClient();
      gateway.handleLeaveRoom(client, EVENT_ID);
      expect(client.leave).toHaveBeenCalledWith(`chat:${EVENT_ID}`);
    });
  });
}

function describeHandleSendMessage() {
  describe('chat:send', () => {
    it('should save message and broadcast to room', async () => {
      const client = makeClient({ data: { userId: USER_ID } } as any);
      await gateway.handleSendMessage(client, { eventId: EVENT_ID, content: 'Bonjour' });

      expect(saveMessageMock).toHaveBeenCalledWith(EVENT_ID, USER_ID, 'Bonjour');
      expect(mockServer.to).toHaveBeenCalledWith(`chat:${EVENT_ID}`);
      expect(mockRoom.emit).toHaveBeenCalledWith('chat:message', MESSAGE_RESPONSE);
    });

    it('should disconnect if no userId on client', async () => {
      const client = makeClient({ data: {} } as any);
      await gateway.handleSendMessage(client, { eventId: EVENT_ID, content: 'Bonjour' });
      expect(client.disconnect).toHaveBeenCalled();
    });

    it('should ignore invalid payload silently', async () => {
      const client = makeClient({ data: { userId: USER_ID } } as any);
      await gateway.handleSendMessage(client, { eventId: 'not-a-uuid', content: '' });
      expect(saveMessageMock).not.toHaveBeenCalled();
    });

    it('should ignore service errors silently', async () => {
      saveMessageMock.mockRejectedValue(new Error('Forbidden'));
      const client = makeClient({ data: { userId: USER_ID } } as any);
      await expect(
        gateway.handleSendMessage(client, { eventId: EVENT_ID, content: 'Bonjour' }),
      ).resolves.not.toThrow();
    });
  });
}

describe('MessagesGateway', () => {
  setupBeforeEach();
  describeHandleConnection();
  describeHandleJoinLeave();
  describeHandleSendMessage();
});
