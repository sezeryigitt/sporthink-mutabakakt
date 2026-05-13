import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MicrosoftTokenService } from './microsoft-token.service';
import { AuditLogService } from './audit-log.service';
import { AppJwtService } from './app-jwt.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, MicrosoftTokenService, AuditLogService, AppJwtService],
  exports: [AppJwtService],
})
export class AuthModule {}
