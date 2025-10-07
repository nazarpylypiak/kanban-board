import {
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../boards/entities/board.entity';
import { CreateColumnDto } from './dto/create-column.dto';
import { Column } from './entities/column.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
    @InjectRepository(Column) private columnRepository: Repository<Column>
  ) {}

  findAll() {
    return this.columnRepository.find({ relations: ['tasks'] });
  }

  findAllByBoardId(boardId: string) {
    return this.columnRepository.find({
      where: {
        board: { id: boardId }
      },
      relations: ['tasks'],
      select: ['id', 'name', 'boardId']
    });
  }

  async create(dto: CreateColumnDto) {
    console.log(dto);
    const board = await this.boardRepository.findOne({
      where: { id: dto.boardId },
      relations: ['owner']
    });

    if (!board) throw new NotFoundException('Board not found');

    if (board.owner.id !== dto.user.id && dto.user.role !== 'admin') {
      throw new ForbiddenException('You do not have permission to add columns');
    }
    const column = this.columnRepository.create({
      name: dto.name,
      board
    });
    const newColumn = await this.columnRepository.save(column);

    return {
      id: newColumn.id,
      name: newColumn.name,
      boardId: newColumn.boardId
    };
  }
}
