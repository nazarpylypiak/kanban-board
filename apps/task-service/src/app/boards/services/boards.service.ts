import { Board, JWTUser, LoggerService, User } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { ShareBoardDto } from '../dto/share-board.dto';
import { BoardEventsService } from './board-events.service';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly boardEventsService: BoardEventsService,
    private readonly logger: LoggerService
  ) {}

  async findAll() {
    const logger = this.logger.child({});
    logger.debug('Fetching all boards');
    const boards = await this.boardRepository.find({ relations: ['columns'] });
    logger.debug('Fetched boards', { boardCount: boards.length });
    return boards;
  }

  async findAllByOwner(ownerId: string) {
    const logger = this.logger.child({ ownerId });
    logger.debug('Fetching boards by owner');
    const boards = await this.boardRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['columns', 'owner']
    });
    logger.debug('Fetched boards by owner', { boardCount: boards.length });
    return boards;
  }

  async findOne(id: string) {
    const logger = this.logger.child({ boardId: id });
    logger.debug('Fetching board');
    const board = await this.boardRepository.findOne({
      where: { id },
      relations: ['columns']
    });
    if (!board) {
      logger.warn('Board not found');
      throw new NotFoundException('Board not found');
    }
    logger.debug('Board fetched');
    return board;
  }

  async update(id: string, name: string) {
    const logger = this.logger.child({ boardId: id });
    logger.debug('Updating board', { name });
    await this.boardRepository.update(id, { name });
    logger.info('Board updated');
  }

  async findAllForUser(userId: string, role: 'admin' | 'user') {
    this.logger.debug('Fetching boards for user', { userId, role });
    const query = this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.sharedUsers', 'sharedUsers');

    const boards =
      role === 'admin'
        ? await query.getMany()
        : await query
            .where('board.ownerId = :userId', { userId })
            .orWhere(
              `:userId::uuid = ANY(string_to_array(board.sharedUserIds, ',')::uuid[])`,
              { userId }
            )
            .getMany();

    this.logger.debug('Fetched boards', { userId, boardCount: boards.length });
    return boards;
  }

  async findBoardUsers(boardId: string, jwtUser: JWTUser) {
    this.logger.debug('Fetching board users', { boardId, userId: jwtUser.sub });

    const board = await this.boardRepository.findOne({
      where: { id: boardId },
      relations: ['owner', 'sharedUsers']
    });

    if (!board) {
      this.logger.warn('Board not found', { boardId });
      throw new NotFoundException('Board not found');
    }

    const isOwner = board.ownerId === jwtUser.sub;
    const isAdmin = jwtUser.role === 'admin';
    const isShared = board.sharedUsers?.some((u) => u.id === jwtUser.sub);

    if (!isOwner && !isAdmin && !isShared) {
      this.logger.warn('User forbidden to view board users', {
        boardId,
        userId: jwtUser.sub
      });
      throw new ForbiddenException(
        'You do not have permission to view board users'
      );
    }

    const filteredUsers = board.sharedUsers.filter(
      ({ id }) => id !== board.owner.id
    );

    const users = [...filteredUsers, board.owner].map(
      ({ id, email, role }) => ({
        id,
        email,
        role
      })
    );

    this.logger.debug('Board users retrieved', {
      boardId,
      usersCount: users.length
    });
    return users;
  }

  async create(ownerId: string, dto: CreateBoardDto) {
    this.logger.debug('Creating board', { ownerId, dto });
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      this.logger.warn('Owner not found', { ownerId });
      throw new NotFoundException('Owner not found');
    }

    const sharedUsers = dto.sharedUserIds?.length
      ? await this.userRepository.find({ where: { id: In(dto.sharedUserIds) } })
      : [];

    const board = this.boardRepository.create({
      name: dto.name,
      owner,
      sharedUsers
    });
    const { id, name } = await this.boardRepository.save(board);

    this.logger.info('Board created', { boardId: id, ownerId });
    return { id, name, ownerId: owner.id };
  }

  async delete(boardId: string, currentUser: JWTUser) {
    this.logger.debug('Deleting board', { boardId, userId: currentUser.sub });
    const board = await this.checkBoard(boardId);
    this.checkPermission(board, currentUser);

    await this.boardRepository.delete(boardId);

    this.boardEventsService.publishDeleted(
      boardId,
      board.sharedUserIds,
      currentUser,
      board.ownerId
    );

    this.logger.info('Board deleted', { boardId, userId: currentUser.sub });
    return { message: 'Deleted successfully' };
  }

  async shareBoard(boardId: string, dto: ShareBoardDto, currentUser: JWTUser) {
    this.logger.debug('Sharing board', {
      boardId,
      userId: currentUser.sub,
      newUserIds: dto.userIds
    });
    const board = await this.boardRepository.findOne({
      where: { id: boardId }
    });
    if (!board) {
      this.logger.warn('Board not found', { boardId });
      throw new NotFoundException('Board not found');
    }
    this.checkPermission(board, currentUser);

    const removedUserIds = await this.computeSharedChanges(board, dto.userIds);
    const savedBoard = await this.boardRepository.save(board);

    this.boardEventsService.publishShared(board, currentUser);
    if (removedUserIds.length) {
      this.boardEventsService.publishDeleted(
        boardId,
        removedUserIds,
        currentUser,
        board.ownerId
      );
    }

    this.logger.info('Board shared updated', {
      boardId,
      sharedUserIds: savedBoard.sharedUsers.map((u) => u.id)
    });
    return {
      id: savedBoard.id,
      name: savedBoard.name,
      ownerId: savedBoard.ownerId,
      sharedUserIds: savedBoard.sharedUsers.map(({ id }) => id)
    };
  }

  private async checkBoard(id: string) {
    const board = await this.boardRepository.findOne({ where: { id } });
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  private checkPermission(board: Board, currentUser: JWTUser) {
    const isAdmin = currentUser.role === 'admin';
    const isOwner = board.ownerId === currentUser.sub;
    if (!isOwner && !isAdmin) {
      this.logger.warn('Permission denied', {
        boardId: board.id,
        userId: currentUser.sub
      });
      throw new ForbiddenException('No permission');
    }
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
