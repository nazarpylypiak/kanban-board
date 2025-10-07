import { TaskStatus } from '@kanban-board/shared';
import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn
} from 'typeorm';
import { Column } from '../../columns/entities/column.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  title: string;

  @TypeOrmColumn({ nullable: true })
  description: string;

  @TypeOrmColumn({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @TypeOrmColumn({ nullable: true })
  assignedTo: string;

  @ManyToOne(() => Column, (column) => column.tasks, { onDelete: 'CASCADE' })
  columns: Column[];
}
