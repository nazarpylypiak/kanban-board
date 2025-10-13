import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn
} from 'typeorm';
import { Board } from './board.entity';
import { Column } from './column.entity';
import { User } from './user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TypeOrmColumn()
  title!: string;

  @TypeOrmColumn({ nullable: true })
  description?: string;

  @ManyToMany(() => User, { nullable: true })
  @JoinTable()
  assignees?: User[];

  @TypeOrmColumn('simple-array', { nullable: true })
  assigneeIds?: string[];

  @TypeOrmColumn('simple-array', { nullable: true })
  assigneeEmails!: string[];

  @ManyToOne(() => User, { nullable: true, eager: true })
  owner!: User;

  @TypeOrmColumn()
  ownerId!: string;

  @ManyToOne(() => Board, (board) => board.tasks, {
    onDelete: 'CASCADE',
    eager: true
  })
  board!: Board;

  @TypeOrmColumn()
  boardId!: string;

  @ManyToOne(() => Column, (column) => column.tasks, { onDelete: 'CASCADE' })
  column!: Column;

  @TypeOrmColumn()
  columnId!: string;

  @TypeOrmColumn({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @TypeOrmColumn({ default: false })
  isDone!: boolean;

  @TypeOrmColumn({ type: 'int', default: 0 })
  position!: number;

  @TypeOrmColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @TypeOrmColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt!: Date;
}
