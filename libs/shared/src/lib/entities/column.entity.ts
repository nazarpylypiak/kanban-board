import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  UpdateDateColumn
} from 'typeorm';
import { Board } from './board.entity';
import { Task } from './task.entity';

@Entity('columns')
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TypeOrmColumn()
  name!: string;

  @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
  board!: Board;

  @TypeOrmColumn()
  boardId!: string;

  @OneToMany(() => Task, (task) => task.column)
  tasks!: Task[];

  @TypeOrmColumn({ default: false })
  isDone!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
