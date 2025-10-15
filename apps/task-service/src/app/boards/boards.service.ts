import { Board, JWTUser, RabbitmqService, User } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { ShareBoardDto } from './dto/share-board.dto';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>,

    private readonly rmqService: RabbitmqService
  ) {}

  async findAllForUser(userId: string, role: 'admin' | 'user') {
    const query = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.sharedUsers', 'sharedUsers');

    if (role === 'admin') {
      return query.getMany();
    } else {
      return query
        .where('board.ownerId = :userId', { userId })
        .orWhere(
          `:userId::uuid = ANY(string_to_array(board.sharedUserIds, ',')::uuid[])`,
          { userId }
        )
        .getMany();
    }
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

  async findBoardUsers(boardId: string, jwtUser: JWTUser) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['owner', 'sharedUsers']
    });

    if (!board) throw new NotFoundException('Board not found');

    const isOwner = board.ownerId === jwtUser.sub;
    const isAdmin = jwtUser.role === 'admin';
    const isShared = board.sharedUsers?.some((u) => u.id === jwtUser.sub);

    if (!isOwner && !isAdmin && !isShared)
      throw new ForbiddenException(
        'You do not have permission to view board users'
      );

    const filteredUsers = board.sharedUsers.filter(
      ({ id }) => id !== board.owner.id
    );

    return [...filteredUsers, board.owner].map(({ id, email, role }) => ({
      id,
      email,
      role
    }));
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
    const { id, name } = await this.boardRepository.save(board);

    return {
      id,
      name,
      ownerId: owner.id
    };
  }

  update(id: string, name: string) {
    return this.boardRepository.update(id, { name });
  }

  delete(id: string) {
    return this.boardRepository.delete(id);
  }

  async shareBoard(boardId: string, dto: ShareBoardDto, currentUser: JWTUser) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId }
    });
    if (!board) throw new NotFoundException('Board not found');
    const isAdmin = currentUser.role === 'admin';
    const isOwner = board.ownerId === currentUser.sub;

    if (!isOwner && !isAdmin) throw new ForbiddenException('No permission');

    const removedUsers: string[] =
      board?.sharedUserIds?.filter((id) => !dto.userIds.includes(id)) ?? [];
    const users = await this.userRepository.findBy({ id: In(dto.userIds) });

    board.sharedUsers = users;
    board.sharedUserIds = users.map(({ id }) => id);

    const savedBoard = await this.boardRepository.save(board);

    // Notify users

    this.rmqService.publish('kanban_exchange', 'board.shared', {
      payload: { board },
      createdBy: currentUser?.sub,
      recipientIds: board.sharedUserIds
    });
    if (removedUsers?.length > 0) {
      this.rmqService.publish('kanban_exchange', 'board.unshared', {
        payload: { boardId },
        createdBy: currentUser?.sub,
        recipientIds: removedUsers
      });
    }

    return {
      id: savedBoard.id,
      name: savedBoard.name,
      ownerId: savedBoard.ownerId,
      sharedUserIds: savedBoard.sharedUsers.map(({ id }) => id)
    };
  }
}
