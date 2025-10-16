import { RefreshToken, User, UserRole } from '@kanban-board/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from './dto';
import { setRefreshCookie } from './utils/cookies';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private configService: ConfigService
  ) {}

  /** ------------------- Register ---------------- */
  async register(dto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email }
    });
    if (existingUser) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      email: dto.email,
      password: hashed,
      role: dto.role || UserRole.USER
    });

    await this.userRepository.save(user);

    return { id: user.id, email: user.email, role: user.role };
  }

  /** ------------------- Login ------------------- */
  async login(dto: LoginDto, res: FastifyReply) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'password', 'role']
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user);

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: hashedRefreshToken,
      user,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    // Set refresh token in cookie
    setRefreshCookie(res, tokens.refreshToken, {
      isProd: this.configService.get<string>('NODE_ENV') === 'production'
    });

    return { accessToken: tokens.accessToken };
  }

  /** --------------- Refresh Tokens -------------- */
  async refreshTokensFromCookie(req: FastifyRequest, res: FastifyReply) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new ForbiddenException('No refresh token');

    const { user, tokenEntity } = await this.validateRefreshToken(refreshToken);

    const tokens = this.generateTokens(user);

    tokenEntity.token = await bcrypt.hash(tokens.refreshToken, 10);
    tokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.save(tokenEntity);

    setRefreshCookie(res, tokens.refreshToken, {
      isProd: this.configService.get<string>('NODE_ENV') === 'production'
    });

    return { accessToken: tokens.accessToken };
  }

  /** ------------------- Logout ------------------ */
  async logout(req: FastifyRequest, res: FastifyReply) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) return;

    try {
      const { tokenEntity } = await this.validateRefreshToken(refreshToken);
      await this.refreshTokenRepository.remove(tokenEntity);
    } catch {
      // silently ignore invalid/missing tokens
    }

    res.clearCookie('refreshToken', { path: '/' });
  }

  /** ------------- Token Generation -------------- */
  generateTokens(user: User) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN')
      } as JwtSignOptions
    );
    const refreshToken = this.jwtService.sign({ sub: user.id }, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN')
    } as JwtSignOptions);
    return { accessToken, refreshToken };
  }

  /** ------- Helper: Validate Refresh Token ------ */
  private async validateRefreshToken(token: string) {
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      }) as { sub: string };
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub }
    });
    if (!user) throw new ForbiddenException('User not found');

    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { user: { id: user.id } }
    });
    if (!tokenEntity) throw new ForbiddenException('Refresh token not found');

    const isMatch = await bcrypt.compare(token, tokenEntity.token);
    if (!isMatch) throw new ForbiddenException('Refresh token mismatch');

    return { user, tokenEntity, payload };
  }
}
