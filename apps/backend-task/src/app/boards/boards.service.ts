import { User } from '@kanban-board/shared';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  findAll() {
    return this.boardRepository.find({ relations: ['tasks'] });
  }

  findAllByOwner(ownerId: string) {
    return this.boardRepository.find({
      where: {
        owner: { id: ownerId }
      },
      relations: ['tasks', 'owner']
    });
  }

  findOne(id: string) {
    return this.boardRepository.findOne({
      where: { id },
      relations: ['tasks']
    });
  }

  async create(ownerId: string, dto: CreateBoardDto) {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    console.log('ownerId', typeof ownerId, ownerId);
    console.log('owner', owner);
    if (!owner) throw new NotFoundException('Owner not found');
    const sharedUsers = dto.sharedUserIds?.length
      ? await this.userRepository.find({
          where: { id: In(dto.sharedUserIds) }
        })
      : [];

    const board = this.boardRepository.create({
      name: dto.name,
      owner,
      sharedUsers
    });

    return this.boardRepository.save(board);
  }

  update(id: string, name: string) {
    return this.boardRepository.update(id, { name });
  }

  delete(id: string) {
    return this.boardRepository.delete(id);
  }
}
