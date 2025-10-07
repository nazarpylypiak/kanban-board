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

  @ManyToOne(() => Column, (column) => column.tasks, { onDelete: 'CASCADE' })
  column: Column;

  @TypeOrmColumn()
  columnId: string;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position: number;
}
