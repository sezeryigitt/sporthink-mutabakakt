import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { MicrosoftLoginDto } from './dto/microsoft-login.dto';
import { AuthService } from './auth.service';
import { AuthUser } from './types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('microsoft/login')
  @Public()
  microsoftLogin(@Body() body: MicrosoftLoginDto, @Req() request: Request) {
    return this.authService.microsoftLogin(body.id_token, request);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.currentUser(user);
  }
}
