/**
 * Tests unitaires — AuthService
 * Vérifie la logique d'authentification : validation des identifiants,
 * inscription, connexion et rafraîchissement des tokens JWT.
 * UsersService et JwtService sont mockés.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = { signAsync: jest.fn().mockResolvedValue('mock-token') };

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  password: 'hashed',
  name: 'Test User',
  refreshToken: null,
};

let service: AuthService;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },

      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    mockJwtService.signAsync.mockResolvedValue('mock-token');
  });
}

function describeValidateUser() {
  describe('validateUser', () => {
    /** Retourne l'utilisateur si les identifiants sont corrects */
    it('should return user if credentials are valid', async () => {
      const hashed = await bcrypt.hash('Password123!', 12);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password: hashed });

      const result = await service.validateUser('test@example.com', 'Password123!');
      expect(result).toBeDefined();
    });

    /** Retourne null si l'utilisateur n'existe pas */
    it('should return null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('unknown@example.com', 'pass');
      expect(result).toBeNull();
    });

    /** Retourne null si le mot de passe est incorrect */
    it('should return null if password is wrong', async () => {
      const hashed = await bcrypt.hash('correct', 12);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password: hashed });

      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });
  });
}

function describeRegister() {
  describe('register', () => {
    /** Crée un utilisateur et retourne une paire de tokens */
    it('should create user and return tokens', async () => {
      mockUsersService.create.mockResolvedValue({ id: 'uuid-1' });
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
}

function describeLogin() {
  describe('login', () => {
    /** Génère une paire de tokens pour un userId valide */
    it('should return tokens for valid userId', async () => {
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.login('uuid-1');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
}

function describeRefresh() {
  describe('refresh', () => {
    /** Lève une exception si l'utilisateur est introuvable */
    it('should throw if user not found', async () => {
      mockUsersService.findById.mockRejectedValue(new Error());
      await expect(service.refresh('bad-id', 'token')).rejects.toThrow();
    });

    /** Lève UnauthorizedException si le refresh token ne correspond pas */
    it('should throw if refresh token does not match', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        refreshToken: await bcrypt.hash('correct-token', 10),
      });

      await expect(service.refresh('uuid-1', 'wrong-token')).rejects.toThrow(UnauthorizedException);
    });

    /** Retourne de nouveaux tokens si le refresh token est valide */
    it('should return new tokens if refresh token is valid', async () => {
      const raw = 'valid-refresh-token';
      const hashed = await bcrypt.hash(raw, 10);

      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, refreshToken: hashed });
      mockUsersService.updateRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('uuid-1', raw);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
}

describe('AuthService', () => {
  setupBeforeEach();
  describeValidateUser();
  describeRegister();
  describeLogin();
  describeRefresh();
});
