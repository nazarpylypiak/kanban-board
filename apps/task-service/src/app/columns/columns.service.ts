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
    return this.columnRepository.find({
      relations: ['tasks'],
      order: {
        tasks: {
          position: 'ASC'
        }
      }
    });
  }

  findAllByBoardId(boardId: string) {
    return this.columnRepository.find({
      where: {
        board: { id: boardId }
      },
      relations: ['tasks', 'tasks.assignees'],
      select: ['id', 'name', 'boardId', 'isDone'],
      order: {
        createdAt: 'ASC',
        tasks: {
          position: 'ASC'
        }
      }
    });
  }

  async create(dto: CreateColumnDto, jwtUser: JWTUser) {
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
      createdAt: savedColumn.createdAt,
      updatedAt: savedColumn.updatedAt
    } satisfies IColumn;
  }

  async update(id: string, dto: UpdateBoardDTo) {
    const column = await this.columnRepository.findOne({ where: { id } });
    if (!column) throw new NotFoundException('Column not fonud');

    Object.assign(column, dto);
    return this.columnRepository.save(column);
  }
}
