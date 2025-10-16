import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply
  ) {
    return this.authService.login(dto, reply);
  }

  @Post('refresh')
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    return this.authService.refreshTokensFromCookie(req, res);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    await this.authService.logout(req, res);
  }
}
