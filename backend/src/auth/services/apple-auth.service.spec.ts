/**
 * Tests unitaires — AppleAuthService
 * Vérifie la vérification du identityToken Apple et la création/récupération
 * de l'utilisateur. Gère le cas où fullName n'est pas fourni (Apple ne l'envoie qu'une fois).
 * apple-signin-auth et UsersService sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppleAuthService } from './apple-auth.service';
import { UsersService } from '../../users/users.service';
import { Provider } from '@prisma/client';
import * as appleSignin from 'apple-signin-auth';

jest.mock('apple-signin-auth');

const mockUsersService = { findOrCreateOAuth: jest.fn() };
const mockConfigService = { getOrThrow: jest.fn().mockReturnValue('com.wordevent.app') };
const mockUser = { id: 'uuid-1', email: 'apple@example.com', name: 'Apple User' };

let service: AppleAuthService;
let verifyMock: jest.Mock;

function mockValidPayload() {
  verifyMock.mockResolvedValue({ sub: 'apple-sub-123', email: 'apple@example.com' });
}

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppleAuthService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AppleAuthService>(AppleAuthService);
    jest.clearAllMocks();
    mockConfigService.getOrThrow.mockReturnValue('com.wordevent.app');
    verifyMock = appleSignin.verifyIdToken as jest.Mock;
  });
}

function describeSucces() {
  describe('verifyAndGetUser - succès', () => {
    /** Retourne l'utilisateur pour un identityToken Apple valide avec fullName */
    it('should return user for valid Apple token', async () => {
      mockValidPayload();
      mockUsersService.findOrCreateOAuth.mockResolvedValue(mockUser);

      const result = await service.verifyAndGetUser('valid-token', 'Apple User');

      expect(mockUsersService.findOrCreateOAuth).toHaveBeenCalledWith(
        'apple@example.com', 'Apple User', Provider.APPLE, 'apple-sub-123',
      );
      expect(result).toEqual(mockUser);
    });

    /** Utilise le préfixe de l'email comme nom si fullName est absent */
    it('should use email prefix as name when fullName not provided', async () => {
      mockValidPayload();
      mockUsersService.findOrCreateOAuth.mockResolvedValue(mockUser);

      await service.verifyAndGetUser('valid-token');

      expect(mockUsersService.findOrCreateOAuth).toHaveBeenCalledWith(
        'apple@example.com', 'apple', Provider.APPLE, 'apple-sub-123',
      );
    });
  });
}

function describeErreurs() {
  describe('verifyAndGetUser - erreurs', () => {
    /** Lève UnauthorizedException si le token est invalide */
    it('should throw UnauthorizedException for invalid token', async () => {
      verifyMock.mockRejectedValue(new Error('Invalid'));
      await expect(service.verifyAndGetUser('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    /** Lève UnauthorizedException si le payload n'a ni email ni sub */
    it('should throw if payload has no email or sub', async () => {
      verifyMock.mockResolvedValue({ sub: null, email: null });
      await expect(service.verifyAndGetUser('token')).rejects.toThrow(UnauthorizedException);
    });
  });
}

describe('AppleAuthService', () => {
  setupBeforeEach();
  describeSucces();
  describeErreurs();
});
