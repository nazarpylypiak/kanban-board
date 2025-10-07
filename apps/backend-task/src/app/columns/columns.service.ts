import { Injectable, NotFoundException } from '@nestjs/common';
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
      relations: ['tasks']
    });
  }

  async create(boardId: string, dto: CreateColumnDto) {
    const board = await this.boardRepository.findOne({
      where: { id: boardId }
    });

    if (!board) throw new NotFoundException('Board not found');
    const column = this.columnRepository.create({
      name: dto.name,
      board
    });

    return this.columnRepository.save(column);
  }
}
