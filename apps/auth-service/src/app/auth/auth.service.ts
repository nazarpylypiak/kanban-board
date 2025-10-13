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
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return { accessToken: tokens.accessToken };
  }

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

  async refreshTokensFromCookie(req: FastifyRequest, res: FastifyReply) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) throw new ForbiddenException('No refresh token');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });
    } catch {
      throw new ForbiddenException('Invalid refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub }
    });
    if (!user) throw new ForbiddenException();

    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { user: { id: user.id } }
    });
    if (
      !tokenEntity ||
      !(await bcrypt.compare(refreshToken, tokenEntity.token))
    ) {
      throw new ForbiddenException();
    }

    const tokens = this.generateTokens(user);

    tokenEntity.token = await bcrypt.hash(tokens.refreshToken, 10);
    tokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.save(tokenEntity);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return { accessToken: tokens.accessToken };
  }

  async logout(req: FastifyRequest, res: FastifyReply) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });
    } catch {
      return;
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub }
    });
    if (user) {
      const tokenEntity = await this.refreshTokenRepository.findOne({
        where: { user: { id: user.id } }
      });
      if (tokenEntity) await this.refreshTokenRepository.remove(tokenEntity);
    }

    res.clearCookie('refreshToken', { path: '/' });
  }
}
