import { Controller, ForbiddenException, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('kullanicilar-loglar')
  async getUsersAndLogs(@CurrentUser() user: AuthUser) {
    if (!user.roller.some((role) => role.toLowerCase() === 'admin')) {
      throw new ForbiddenException('Bu sayfa icin admin yetkisi gerekli.');
    }

    return this.adminService.getUsersAndLogs();
  }
}
