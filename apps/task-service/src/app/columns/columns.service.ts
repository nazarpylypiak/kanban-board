import { Board, Column, JWTUser } from '@kanban-board/shared';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ColumnEventsService } from './column-events.service';
import { mapColumnToDto } from './columns.mapper';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { ColumnPolicy } from './policies/column.policy';

@Injectable()
export class ColumnsService {
  private readonly logger = new Logger(ColumnsService.name);

  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Column) private columnRepository: Repository<Column>,
    private readonly columnEventsService: ColumnEventsService,
    private readonly dataSource: DataSource,
    private readonly columnPolicy: ColumnPolicy
  ) {}

  findAll() {
    this.logger.debug('Fetching all columns');
    return this.columnRepository.find();
  }

  async findBoardColumns(boardId: string, jwtUser: JWTUser) {
    this.logger.debug(
      `Fetching columns for board ${boardId} by user ${jwtUser.sub}`
    );

    const userId = jwtUser.sub;
    const isAdmin = jwtUser.role === 'admin';

    const board = await this.boardRepository
      .createQueryBuilder('board')
      .leftJoinAndSelect('board.columns', 'column')
      .leftJoinAndSelect(
        'column.tasks',
        'task',
        isAdmin
          ? '1=1'
          : `task.id IN (
        SELECT ta."tasksId"
        FROM tasks_assignees_users ta
        WHERE ta."usersId" = :userId
      )`
      )
      .leftJoinAndSelect('task.assignees', 'assignee')
      .where('board.id = :boardId', { boardId })
      .setParameter('userId', userId)
      .orderBy('column.createdAt', 'ASC')
      .addOrderBy('task.createdAt', 'ASC')
      .getOne();

    if (!board) {
      this.logger.warn(`Board ${boardId} not found`);
      throw new NotFoundException('Board not found');
    }

    this.logger.debug(
      `Fetched ${board.columns.length} columns for board ${boardId}`
    );
    return board.columns;
  }

  async createBoardColumn(dto: CreateColumnDto, currentUser: JWTUser) {
    this.logger.debug(
      `User ${currentUser.sub} is creating a new column "${dto.name}" on board ${dto.boardId}`
    );

    return this.dataSource
      .transaction(async (manager) => {
        const board = await manager.findOneBy(Board, { id: dto.boardId });
        if (!board) {
          this.logger.warn(`Board ${dto.boardId} not found`);
          throw new NotFoundException('Board not found');
        }

        this.columnPolicy.assertCanCreate(board, currentUser);

        const exists = await manager.findOne(Column, {
          where: { name: dto.name, boardId: dto.boardId }
        });
        if (exists) {
          this.logger.warn(
            `Column name "${dto.name}" already exists on board ${dto.boardId}`
          );
          throw new ConflictException('Column name already exists');
        }

        const column = manager.create(Column, { name: dto.name, board });
        const savedColumn = await manager.save(column);

        this.logger.log(
          `Column ${savedColumn.id} ("${savedColumn.name}") created on board ${board.id} by user ${currentUser.sub}`
        );

        return savedColumn;
      })
      .then((column) => {
        this.columnEventsService.publishCreated(column, currentUser);
        this.logger.debug(`Column creation event published for ${column.id}`);
        return mapColumnToDto(column);
      });
  }

  async update(columnId: string, dto: UpdateColumnDto, currentUser: JWTUser) {
    this.logger.debug(`User ${currentUser.sub} updating column ${columnId}`);

    const column = await this.columnRepository
      .createQueryBuilder('column')
      .leftJoinAndSelect('column.board', 'board')
      .where('column.id = :id', { id: columnId })
      .select([
        'column.id',
        'board.ownerId',
        'column.name',
        'column.isDone',
        'column.createdAt',
        'column.updatedAt'
      ])
      .getOne();

    if (!column) {
      this.logger.warn(`Column ${columnId} not found`);
      throw new NotFoundException('Column not found');
    }

    this.columnPolicy.assertCanUpdate(column, currentUser);

    Object.assign(column, dto);
    const updatedColumn = await this.columnRepository.save(column);

    this.logger.log(`Column ${columnId} updated by user ${currentUser.sub}`);

    await this.columnEventsService.publishCreated(updatedColumn, currentUser);
    this.logger.debug(`Column update event published for ${columnId}`);

    return mapColumnToDto(updatedColumn);
  }

  async delete(columnId: string, currentUser: JWTUser) {
    this.logger.debug(`User ${currentUser.sub} deleting column ${columnId}`);

    return this.dataSource
      .transaction(async (manager) => {
        const column = await this.columnRepository
          .createQueryBuilder('column')
          .leftJoinAndSelect('column.board', 'board')
          .leftJoinAndSelect('board.sharedUsers', 'sharedUsers')
          .where('column.id = :id', { id: columnId })
          .getOne();

        if (!column) {
          this.logger.warn(`Column ${columnId} not found`);
          throw new NotFoundException('Column not found');
        }

        this.columnPolicy.assertCanDelete(column, currentUser);

        await manager.delete(Column, columnId);
        this.logger.log(
          `Column ${columnId} deleted by user ${currentUser.sub}`
        );

        return {
          columnId,
          sharedUserIds: column.board.sharedUsers.map(({ id }) => id),
          ownerId: column.board.ownerId
        };
      })
      .then(({ columnId, sharedUserIds, ownerId }) => {
        this.columnEventsService.publishDelete(
          columnId,
          sharedUserIds,
          currentUser,
          ownerId
        );

        this.logger.debug(`Column delete event published for ${columnId}`);
        return { message: 'deleted successfully' };
      });
  }
}
