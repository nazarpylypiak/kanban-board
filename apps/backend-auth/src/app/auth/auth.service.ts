import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto';

interface User {
  id: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

@Injectable()
export class AuthService {
  private users: User[] = [];

  constructor(private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);
    const user = { id: Date.now().toString(), ...dto, password: hashed };
    this.users.push(user);
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto) {
    const user = this.users.find((u) => u.email === dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
