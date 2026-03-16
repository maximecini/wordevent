import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ParticipationsModule } from './participations/participations.module';
import { MessagesModule } from './messages/messages.module';
import { InvitationsModule } from './invitations/invitations.module';
import { PlacesOfInterestModule } from './places-of-interest/places-of-interest.module';

@Module({
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60000, limit: 120 },
      { name: 'auth', ttl: 60000, limit: 10 },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    EventsModule,
    ParticipationsModule,
    MessagesModule,
    InvitationsModule,
    PlacesOfInterestModule,
  ],
})
export class AppModule {}
