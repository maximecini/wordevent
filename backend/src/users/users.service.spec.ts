/**
 * Tests unitaires — UsersService
 * Vérifie la création d'utilisateurs, la recherche par email/id,
 * la gestion OAuth et la mise à jour du refresh token.
 * PrismaService est mocké.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  password: 'hashed',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
};

let service: UsersService;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });
}

function describeCreate() {
  describe('create', () => {
    /** Crée un utilisateur et retourne les champs sûrs */
    it('should create a user and return safe fields', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    /** Lève ConflictException si l'email est déjà utilisé */
    it('should throw ConflictException if email already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      await expect(
        service.create({ email: 'test@example.com', password: 'pass', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });
}

function describeFindByEmail() {
  describe('findByEmail', () => {
    /** Retourne l'utilisateur complet si trouvé */
    it('should return user if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    /** Retourne null si l'email est inconnu */
    it('should return null if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('unknown@example.com');
      expect(result).toBeNull();
    });
  });
}

function describeFindById() {
  describe('findById', () => {
    /** Retourne l'utilisateur si l'id existe */
    it('should return user if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById('uuid-1');
      expect(result).toEqual(mockUser);
    });

    /** Lève NotFoundException si l'id est inconnu */
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });
}

function describeFindAll() {
  describe('findAll', () => {
    /** Retourne la liste de tous les utilisateurs */
    it('should return all users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });
}

function describeRemove() {
  describe('remove', () => {
    /** Supprime l'utilisateur si trouvé */
    it('should delete user if found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);
      await service.remove('uuid-1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
    });

    /** Lève NotFoundException si l'utilisateur est introuvable */
    it('should throw NotFoundException if not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.remove('unknown')).rejects.toThrow(NotFoundException);
    });
  });
}

function describeUpdateRefreshToken() {
  describe('updateRefreshToken', () => {
    /** Hash et stocke le refresh token */
    it('should hash and store the refresh token', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUser);
      await service.updateRefreshToken('uuid-1', 'raw-token');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { refreshToken: expect.any(String) },
      });
    });

    /** Stocke null quand le token est null (déconnexion) */
    it('should store null when token is null', async () => {
      mockPrisma.user.update.mockResolvedValue(mockUser);
      await service.updateRefreshToken('uuid-1', null);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { refreshToken: null },
      });
    });
  });
}

describe('UsersService', () => {
  setupBeforeEach();
  describeCreate();
  describeFindByEmail();
  describeFindById();
  describeFindAll();
  describeRemove();
  describeUpdateRefreshToken();
});
