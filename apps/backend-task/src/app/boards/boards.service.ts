import { JWTUser, User } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BoardsGateway } from './boards.gateway';
import { CreateBoardDto } from './dto/create-board.dto';
import { ShareBoardDto } from './dto/share-board.dto';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly boardsGateway: BoardsGateway
  ) {}

  async findAllForUser(userId: string) {
    return this.boardRepository
      .createQueryBuilder('boards')
      .leftJoinAndSelect('boards.owner', 'owner')
      .leftJoinAndSelect('boards.sharedUsers', 'sharedUsers')
      .where('owner.id = :userId', { userId })
      .orWhere('sharedUsers.id = :userId', { userId })
      .getMany();
  }

  findAll() {
    return this.boardRepository.find({ relations: ['columns'] });
  }

  findAllByOwner(ownerId: string) {
    return this.boardRepository.find({
      where: {
        owner: { id: ownerId }
      },
      relations: ['columns', 'owner']
    });
  }

  findOne(id: string) {
    return this.boardRepository.findOne({
      where: { id },
      relations: ['columns']
    });
  }

  async create(ownerId: string, dto: CreateBoardDto) {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });

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

  async shareBoard(boardId: string, dto: ShareBoardDto, currentUser: JWTUser) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['owner', 'sharedUsers']
    });

    if (!board) throw new NotFoundException('Board not found');
    if (board.owner.id !== currentUser.sub && currentUser.role !== 'admin') {
      throw new ForbiddenException('No permission');
    }

    const users = await this.userRepository.findBy({ id: In(dto.userIds) });

    const removedUsers = board.sharedUsers.filter(
      (u) => !dto.userIds.includes(u.id)
    );

    board.sharedUsers = users;
    const savedBoard = await this.boardRepository.save(board);

    this.boardsGateway.notifyBoardShared(board);

    // Notify removed users
    removedUsers.forEach((u) => {
      this.boardsGateway.notifyBoardRemoved(board.id, u.id);
    });

    return savedBoard;
  }
}
