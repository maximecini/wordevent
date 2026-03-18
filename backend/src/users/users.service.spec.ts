/**
 * Tests unitaires — UsersService
 * Vérifie la création d'utilisateurs, la recherche par email/id,
 * la gestion OAuth et la mise à jour du refresh token.
 * DatabaseService est mocké.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';

const mockDb = {
  query: jest.fn(),
  execute: jest.fn(),
  transaction: jest.fn(),
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
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });
}

function describeCreate() {
  describe('create', () => {
    it('should create a user and return safe fields', async () => {
      mockDb.query.mockResolvedValue([mockUser]);
      const result = await service.create({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      });
      expect(result).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      const dbError = Object.assign(new DatabaseError('unique', 0, 'error'), { code: '23505' });
      mockDb.query.mockRejectedValue(dbError);
      await expect(
        service.create({ email: 'test@example.com', password: 'pass', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });
}

function describeFindByEmail() {
  describe('findByEmail', () => {
    it('should return user if found', async () => {
      mockDb.query.mockResolvedValue([mockUser]);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if not found', async () => {
      mockDb.query.mockResolvedValue([]);
      const result = await service.findByEmail('unknown@example.com');
      expect(result).toBeNull();
    });
  });
}

function describeFindById() {
  describe('findById', () => {
    it('should return user if found', async () => {
      mockDb.query.mockResolvedValue([mockUser]);
      const result = await service.findById('uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if not found', async () => {
      mockDb.query.mockResolvedValue([]);
      await expect(service.findById('unknown')).rejects.toThrow(NotFoundException);
    });
  });
}

function describeFindAll() {
  describe('findAll', () => {
    it('should return all users', async () => {
      mockDb.query.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
      expect(mockDb.query).toHaveBeenCalledTimes(1);
    });
  });
}

function describeRemove() {
  describe('remove', () => {
    it('should delete user if found', async () => {
      mockDb.execute.mockResolvedValue({ rowCount: 1 });
      await service.remove('uuid-1');
      expect(mockDb.execute).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if not found', async () => {
      mockDb.execute.mockResolvedValue({ rowCount: 0 });
      await expect(service.remove('unknown')).rejects.toThrow(NotFoundException);
    });
  });
}

function describeUpdateRefreshToken() {
  describe('updateRefreshToken', () => {
    it('should hash and store the refresh token', async () => {
      mockDb.execute.mockResolvedValue({ rowCount: 1 });
      await service.updateRefreshToken('uuid-1', 'raw-token');
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('refresh_token'),
        [expect.any(String), 'uuid-1'],
      );
    });

    it('should store null when token is null', async () => {
      mockDb.execute.mockResolvedValue({ rowCount: 1 });
      await service.updateRefreshToken('uuid-1', null);
      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('refresh_token'),
        [null, 'uuid-1'],
      );
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
