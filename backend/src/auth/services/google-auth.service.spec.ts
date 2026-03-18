/**
 * Tests unitaires — GoogleAuthService
 * Vérifie la vérification du idToken Google et la création/récupération
 * de l'utilisateur via findOrCreateOAuth.
 * OAuth2Client et UsersService sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { UsersService } from '../../users/users.service';
import { Provider } from '../../common/types/enums';
import { OAuth2Client } from 'google-auth-library';

jest.mock('google-auth-library');

const mockUsersService = { findOrCreateOAuth: jest.fn() };
const mockUser = { id: 'uuid-1', email: 'google@example.com', name: 'Google User' };

let service: GoogleAuthService;
let verifyMock: jest.Mock;

function setupBeforeEach() {
  beforeEach(async () => {
    verifyMock = jest.fn();
    (OAuth2Client as unknown as jest.Mock).mockImplementation(() => ({ verifyIdToken: verifyMock }));

    process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleAuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<GoogleAuthService>(GoogleAuthService);
    jest.clearAllMocks();
  });
}

function describeSucces() {
  describe('verifyAndGetUser - succès', () => {
    /** Retourne l'utilisateur pour un idToken Google valide */
    it('should return user for valid Google token', async () => {
      verifyMock.mockResolvedValue({
        getPayload: () => ({ sub: 'google-123', email: 'google@example.com', name: 'Google User' }),
      });
      mockUsersService.findOrCreateOAuth.mockResolvedValue(mockUser);

      const result = await service.verifyAndGetUser('valid-id-token');

      expect(mockUsersService.findOrCreateOAuth).toHaveBeenCalledWith(
        'google@example.com', 'Google User', Provider.GOOGLE, 'google-123',
      );
      expect(result).toEqual(mockUser);
    });
  });
}

function describeErreurs() {
  describe('verifyAndGetUser - erreurs', () => {
    /** Lève UnauthorizedException si le token est invalide */
    it('should throw UnauthorizedException for invalid token', async () => {
      verifyMock.mockRejectedValue(new Error('Invalid token'));
      await expect(service.verifyAndGetUser('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    /** Lève UnauthorizedException si le payload ne contient pas d'email */
    it('should throw if payload has no email', async () => {
      verifyMock.mockResolvedValue({ getPayload: () => ({ sub: 'google-123' }) });
      await expect(service.verifyAndGetUser('token-no-email')).rejects.toThrow(UnauthorizedException);
    });
  });
}

describe('GoogleAuthService', () => {
  setupBeforeEach();
  describeSucces();
  describeErreurs();
});
