import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '../common/types/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  /**
   * Liste tous les utilisateurs (admin uniquement).
   *
   * @returns Liste de profils publics de tous les utilisateurs
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Liste tous les utilisateurs (ADMIN)' })
  findAll() {
    return this.service.findAll();
  }

  /**
   * Recherche un utilisateur par email (pour l'invitation).
   * Retourne uniquement le profil public (id, name, avatar).
   *
   * @param email - Email à rechercher
   * @returns Profil public ou null si introuvable
   */
  @Get('search')
  @ApiQuery({ name: 'email', required: true, type: String })
  searchByEmail(@Query('email') email: string) {
    return this.service.searchByEmail(email);
  }

  /**
   * Supprime un utilisateur par son identifiant (admin uniquement).
   *
   * @param id - UUID de l'utilisateur à supprimer
   * @throws NotFoundException si l'utilisateur n'existe pas
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime un utilisateur (ADMIN)' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
