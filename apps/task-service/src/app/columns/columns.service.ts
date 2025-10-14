import { Board, Column, IColumn, JWTUser } from '@kanban-board/shared';
import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBoardDTo } from '../boards/dto/update-board.dto';
import { CreateColumnDto } from './dto/create-column.dto';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Column) private columnRepository: Repository<Column>
  ) {}

  findAll() {
    return this.columnRepository.find();
  }

  async findBoardColumns(boardId: string, jwtUser: JWTUser) {
    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.columns', 'column')
      .leftJoinAndSelect('board.sharedUsers', 'sharedUser')
      .leftJoinAndSelect('column.tasks', 'task')
      .leftJoinAndSelect('task.assignees', 'assignee')
      .select([
        'board.id',
        'board.name',
        'board.ownerId',
        'sharedUser.id',
        'column.id',
        'column.name',
        'column.isDone',
        'column.createdAt',
        'column.updatedAt',
        'column.boardId',
        'task.id',
        'task.title',
        'task.description',
        'task.isDone',
        'task.ownerId',
        'task.boardId',
        'task.columnId',
        'task.createdAt',
        'task.updatedAt',
        'assignee'
      ])
      .where('board.id = :boardId', { boardId })
      .orderBy('column.createdAt', 'ASC')
      .getOne();

    if (!board) throw new NotFoundException('Board not found');

    const isOwner = board.ownerId === jwtUser.sub;
    const isAdmin = jwtUser.role === 'admin';
    const isShared = board.sharedUsers?.some((u) => u.id === jwtUser.sub);

    if (!isOwner && !isAdmin && !isShared)
      throw new ForbiddenException(
        'You do not have permission to view board columns'
      );

    return board.columns;
  }

  async createBoardColumn(dto: CreateColumnDto, jwtUser: JWTUser) {
    const board = await this.boardRepository.findOneBy({
      id: dto.boardId
    });

    if (!board) throw new NotFoundException('Board not found');

    const isAdmin = jwtUser.role === 'admin';
    const isOwner = board.ownerId === jwtUser.sub;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You do not have permission to add columns');
    }
    const column = this.columnRepository.create({
      name: dto.name,
      board
    });
    const savedColumn = await this.columnRepository.save(column);

    await this.boardRepository.save(board);

    return {
      id: savedColumn.id,
      name: savedColumn.name,
      boardId: savedColumn.boardId,
      isDone: savedColumn.isDone,
      createdAt: savedColumn.createdAt.toISOString(),
      updatedAt: savedColumn.updatedAt.toISOString()
    } satisfies IColumn;
  }

  async update(columnId: string, dto: UpdateBoardDTo, jwtUser: JWTUser) {
    const column = await this.columnRepository
      .createQueryBuilder('column')
      .leftJoinAndSelect('column.board', 'board')
      .where('column.id = :columnId', { columnId })
      .select([
        'column.id',
        'board.ownerId',
        'column.name',
        'column.isDone',
        'column.createdAt',
        'column.updatedAt'
      ])
      .getOne();
    if (!column) throw new NotFoundException('Column not fonud');
    const isAdmin = jwtUser.role === 'admin';
    const isOwner = column.board.ownerId === jwtUser.sub;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException(
        'You do not have permission to update column'
      );
    }

    Object.assign(column, dto);
    return await this.columnRepository.save(column);
  }
}
