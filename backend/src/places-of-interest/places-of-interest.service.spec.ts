/**
 * Tests unitaires — PlacesOfInterestService
 * Vérifie la logique CRUD et les requêtes géospatiales pour les POIs personnels.
 * DatabaseService est mocké.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PlacesOfInterestService } from './places-of-interest.service';
import { DatabaseService } from '../database/database.service';
import { PlaceResponse } from './places-of-interest.types';

const mockPlace: PlaceResponse = {
  id: 'place-1', name: 'Mon café', description: null, icon: '☕',
  lat: 48.85, lng: 2.35, userId: 'user-1',
  createdAt: new Date(), updatedAt: new Date(),
};

const rawPlace = { ...mockPlace, lat: '48.85', lng: '2.35' };

const mockDb = { query: jest.fn(), execute: jest.fn(), transaction: jest.fn() };

let service: PlacesOfInterestService;

function setupBeforeEach() {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacesOfInterestService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<PlacesOfInterestService>(PlacesOfInterestService);
    jest.clearAllMocks();
  });
}

function describeCreate() {
  describe('create', () => {
    it('should insert place and return serialized result', async () => {
      mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockDb.query.mockResolvedValueOnce([rawPlace]);

      const result = await service.create('user-1', { name: 'Mon café', icon: '☕', lat: 48.85, lng: 2.35 });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO places_of_interest'),
        expect.arrayContaining(['user-1', 'Mon café']),
      );
      expect(result.name).toBe('Mon café');
      expect(result.lat).toBe(48.85);
    });
  });
}

function describeFindNearby() {
  describe('findNearby', () => {
    it('should query with userId filter and return serialized places', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);

      const result = await service.findNearby('user-1', { lat: 48.85, lng: 2.35 });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('user_id = $4'),
        [2.35, 48.85, 5000, 'user-1'],
      );
      expect(result).toHaveLength(1);
      expect(result[0].lat).toBe(48.85);
    });

    it('should use provided radius', async () => {
      mockDb.query.mockResolvedValueOnce([]);

      await service.findNearby('user-1', { lat: 48.85, lng: 2.35, radius: 1000 });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.any(String), [2.35, 48.85, 1000, 'user-1'],
      );
    });
  });
}

function describeFindById() {
  describe('findById - succès', () => {
    it('should return place for owner', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);

      const result = await service.findById('place-1', 'user-1');
      expect(result.id).toBe('place-1');
    });
  });

  describe('findById - erreurs', () => {
    it('should throw NotFoundException if not found', async () => {
      mockDb.query.mockResolvedValueOnce([]);
      await expect(service.findById('bad', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);
      await expect(service.findById('place-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
}

function describeUpdate() {
  describe('update - succès', () => {
    it('should update scalar fields', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);
      mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockDb.query.mockResolvedValueOnce([rawPlace]);

      await service.update('place-1', 'user-1', { name: 'Nouveau nom' });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE places_of_interest'),
        expect.arrayContaining(['place-1']),
      );
    });

    it('should update location if lat/lng provided', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);
      mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });
      mockDb.query.mockResolvedValueOnce([rawPlace]);

      await service.update('place-1', 'user-1', { lat: 49.0, lng: 2.5 });

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('ST_SetSRID'),
        expect.arrayContaining([2.5, 49.0, 'place-1']),
      );
    });
  });

  describe('update - erreurs', () => {
    it('should throw ForbiddenException if not owner', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);
      await expect(service.update('place-1', 'other-user', { name: 'X' })).rejects.toThrow(ForbiddenException);
    });
  });
}

function describeRemove() {
  describe('remove - succès', () => {
    it('should delete place for owner', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);
      mockDb.execute.mockResolvedValueOnce({ rowCount: 1 });

      await service.remove('place-1', 'user-1');

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM places_of_interest'),
        ['place-1'],
      );
    });
  });

  describe('remove - erreurs', () => {
    it('should throw ForbiddenException if not owner', async () => {
      mockDb.query.mockResolvedValueOnce([rawPlace]);
      await expect(service.remove('place-1', 'other-user')).rejects.toThrow(ForbiddenException);
    });
  });
}

describe('PlacesOfInterestService', () => {
  setupBeforeEach();
  describeCreate();
  describeFindNearby();
  describeFindById();
  describeUpdate();
  describeRemove();
});
