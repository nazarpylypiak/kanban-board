import { Board, JWTUser, User } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BoardEventsService } from './board-events.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ShareBoardDto } from './dto/share-board.dto';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly boardEventsService: BoardEventsService
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

  async delete(boardId: string, currentUser: JWTUser) {
    const board = await this.checkBoard(boardId);

    this.checkPermission(board, currentUser);

    await this.boardRepository.delete(boardId);

    this.boardEventsService.publishDeleted(
      boardId,
      board.sharedUserIds,
      currentUser,
      board.ownerId
    );

    return { message: 'Deleted succussfully' };
  }

  async shareBoard(boardId: string, dto: ShareBoardDto, currentUser: JWTUser) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId }
    });
    if (!board) throw new NotFoundException('Board not found');
    this.checkPermission(board, currentUser);

    const removedUserIds = await this.computeSharedChanges(board, dto.userIds);
    const savedBoard = await this.boardRepository.save(board);

    this.boardEventsService.publishShared(board, currentUser);
    if (removedUserIds.length)
      this.boardEventsService.publishDeleted(
        boardId,
        removedUserIds,
        currentUser,
        board.ownerId
      );

    return {
      id: savedBoard.id,
      name: savedBoard.name,
      ownerId: savedBoard.ownerId,
      sharedUserIds: savedBoard.sharedUsers.map(({ id }) => id)
    };
  }

  private checkBoard(id: string) {
    const board = this.boardRepository.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  private checkPermission(board: Board, currentUser: JWTUser) {
    const isAdmin = currentUser.role === 'admin';
    const isOwner = board.ownerId === currentUser.sub;
    if (!isOwner && !isAdmin) throw new ForbiddenException('No permission');
  }

  private async computeSharedChanges(board: Board, newUserIds: string[]) {
    const removedUserIds =
      board.sharedUserIds?.filter((id) => !newUserIds.includes(id)) ?? [];

    const users = await this.userRepository.findBy({ id: In(newUserIds) });

    board.sharedUsers = users;
    board.sharedUserIds = users.map((u) => u.id);

    return removedUserIds;
  }
}
