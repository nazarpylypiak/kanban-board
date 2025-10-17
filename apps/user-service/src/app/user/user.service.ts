import { mapUserToDto, User, UserDto } from '@kanban-board/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createUser(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword
    });
    const savedUser = await this.userRepository.save(user);

    return mapUserToDto(savedUser);
  }

  async findAllUsers(page = 1, limit = 20) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit
    });

    return {
      data: mapUserToDto(users),
      total,
      page,
      limit
    };
  }

  async findOneUser(userId: string) {
    const user = await this.findUserOrFail(userId);
    return plainToInstance(UserDto, user, { excludeExtraneousValues: true });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.findUserOrFail(userId);
    const updatedData = { ...dto };
    if (dto.password) {
      updatedData.password = await bcrypt.hash(dto.password, 12);
    }
    Object.assign(user, updatedData);
    const savedUser = await this.userRepository.save(user);
    return mapUserToDto(savedUser);
  }

  async remove(userId: string) {
    const user = await this.findUserOrFail(userId);
    const result = await this.userRepository.delete(user.id);
    if (!result.affected) throw new NotFoundException('User not found');
    return { success: true };
  }

  private async findUserOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
