/**
 * Tests unitaires — FacebookAuthService
 * Vérifie la validation du token via Facebook Graph API (debug_token + /me)
 * et la création/récupération de l'utilisateur via findOrCreateOAuth.
 * fetch et UsersService sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { FacebookAuthService } from './facebook-auth.service';
import { UsersService } from '../../users/users.service';
import { Provider } from '../../common/types/enums';

const mockUsersService = { findOrCreateOAuth: jest.fn() };
const mockUser = { id: 'uuid-1', email: 'fb@example.com', name: 'FB User' };

let service: FacebookAuthService;
let fetchMock: jest.Mock;

function mockValidDebugResponse() {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({
      data: { is_valid: true, app_id: 'mock-app-id', user_id: 'fb-123' },
    }),
  };
}

function mockValidMeResponse() {
  return {
    ok: true,
    json: jest.fn().mockResolvedValue({ id: 'fb-123', name: 'FB User', email: 'fb@example.com' }),
  };
}

function setupBeforeEach() {
  beforeEach(async () => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    process.env.FACEBOOK_APP_ID = 'mock-app-id';
    process.env.FACEBOOK_APP_SECRET = 'mock-app-secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookAuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<FacebookAuthService>(FacebookAuthService);
    jest.clearAllMocks();
  });
}

function describeSucces() {
  describe('verifyAndGetUser - succès', () => {
    it('should return user for valid Facebook token', async () => {
      fetchMock
        .mockResolvedValueOnce(mockValidDebugResponse())
        .mockResolvedValueOnce(mockValidMeResponse());
      mockUsersService.findOrCreateOAuth.mockResolvedValue(mockUser);

      const result = await service.verifyAndGetUser('valid-access-token');

      expect(mockUsersService.findOrCreateOAuth).toHaveBeenCalledWith(
        'fb@example.com', 'FB User', Provider.FACEBOOK, 'fb-123',
      );
      expect(result).toEqual(mockUser);
    });

    it('should use fallback email if Facebook does not provide one', async () => {
      fetchMock
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { is_valid: true, app_id: 'mock-app-id', user_id: 'fb-456' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({ id: 'fb-456', name: 'No Email User' }),
        });
      mockUsersService.findOrCreateOAuth.mockResolvedValue(mockUser);

      await service.verifyAndGetUser('token-no-email');

      expect(mockUsersService.findOrCreateOAuth).toHaveBeenCalledWith(
        'fb_fb-456@wordevent.local', 'No Email User', Provider.FACEBOOK, 'fb-456',
      );
    });
  });
}

function describeErreurs() {
  describe('verifyAndGetUser - erreurs', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { is_valid: false } }),
      });
      await expect(service.verifyAndGetUser('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if app_id does not match', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { is_valid: true, app_id: 'wrong-app-id', user_id: 'fb-123' },
        }),
      });
      await expect(service.verifyAndGetUser('wrong-app-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if /me call fails', async () => {
      fetchMock
        .mockResolvedValueOnce(mockValidDebugResponse())
        .mockResolvedValueOnce({ ok: false });
      await expect(service.verifyAndGetUser('token-me-fail')).rejects.toThrow(UnauthorizedException);
    });
  });
}

describe('FacebookAuthService', () => {
  setupBeforeEach();
  describeSucces();
  describeErreurs();
});
