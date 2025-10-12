import { User } from '@kanban-board/shared';
import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { Column } from '../../columns/entities/column.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  title: string;

  @TypeOrmColumn({ nullable: true })
  description: string;

  @ManyToMany(() => User, { nullable: true })
  @JoinTable()
  assignees?: User[];

  @ManyToOne(() => User, { nullable: true, eager: true })
  owner: User;

  @ManyToOne(() => Board, (board) => board.tasks, {
    onDelete: 'CASCADE',
    eager: true
  })
  board: Board;

  @ManyToOne(() => Column, (column) => column.tasks, { onDelete: 'CASCADE' })
  column: Column;

  @TypeOrmColumn()
  columnId: string;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position: number;
}
