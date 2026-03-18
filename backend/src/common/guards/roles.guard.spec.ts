/**
 * Tests unitaires — RolesGuard
 * Vérifie le contrôle d'accès par rôle : accès autorisé si aucun rôle requis,
 * accès refusé si le rôle de l'utilisateur ne correspond pas.
 * Reflector est mocké.
 */
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../types/enums';
import { RolesGuard } from './roles.guard';

const mockReflector = { getAllAndOverride: jest.fn() };

let guard: RolesGuard;

function mockContext(userRole: Role | undefined): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user: { role: userRole } }) }),
  } as unknown as ExecutionContext;
}

function setupBeforeEach() {
  beforeEach(() => {
    guard = new RolesGuard(mockReflector as unknown as Reflector);
    jest.clearAllMocks();
  });
}

function describeAccesLibre() {
  describe('accès libre', () => {
    /** Autorise l'accès si aucun rôle n'est requis sur la route */
    it('should allow access when no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);
      const result = guard.canActivate(mockContext(Role.USER));
      expect(result).toBe(true);
    });

    /** Autorise l'accès si le tableau de rôles requis est vide */
    it('should allow access when required roles list is empty', () => {
      mockReflector.getAllAndOverride.mockReturnValue([]);
      const result = guard.canActivate(mockContext(Role.USER));
      expect(result).toBe(true);
    });
  });
}

function describeAccesRole() {
  describe('accès par rôle', () => {
    /** Autorise l'accès si l'utilisateur a le rôle requis */
    it('should allow access when user has required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const result = guard.canActivate(mockContext(Role.ADMIN));
      expect(result).toBe(true);
    });

    /** Refuse l'accès si l'utilisateur n'a pas le rôle requis */
    it('should deny access when user does not have required role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const result = guard.canActivate(mockContext(Role.USER));
      expect(result).toBe(false);
    });

    /** Refuse l'accès si l'utilisateur n'est pas authentifié */
    it('should deny access when user is not authenticated', () => {
      mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const result = guard.canActivate(mockContext(undefined));
      expect(result).toBe(false);
    });
  });
}

describe('RolesGuard', () => {
  setupBeforeEach();
  describeAccesLibre();
  describeAccesRole();
});
