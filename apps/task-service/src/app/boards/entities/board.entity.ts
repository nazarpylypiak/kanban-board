import { User } from '@kanban-board/shared';
import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Column as TypeOrmColumn
} from 'typeorm';
import { Column } from '../../columns/entities/column.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @TypeOrmColumn()
  name: string;

  @ManyToOne(() => User, { nullable: true })
  owner?: User;

  @ManyToMany(() => User)
  @JoinTable()
  sharedUsers: User[];

  @OneToMany(() => Column, (column) => column.board, { cascade: true })
  columns: Column[];

  @OneToMany(() => Task, (task) => task.board, { cascade: true })
  tasks: Task[];
}
