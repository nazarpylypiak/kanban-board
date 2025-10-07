import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn,
  UpdateDateColumn
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('columns')
export class Column {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  name: string;

  @TypeOrmColumn()
  boardId: string;

  @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
  board: Board;

  @OneToMany(() => Task, (task) => task.columns)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
