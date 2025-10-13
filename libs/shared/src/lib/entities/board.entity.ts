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
import { Column } from './column.entity';
import { Task } from './task.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @TypeOrmColumn()
  name!: string;

  @ManyToOne(() => User, { nullable: true })
  owner?: User;

  @TypeOrmColumn()
  ownerId!: string;

  @ManyToMany(() => User)
  @JoinTable()
  sharedUsers!: User[];

  @TypeOrmColumn('simple-array', { nullable: true })
  sharedUserIds?: string[];

  @OneToMany(() => Column, (column) => column.board, { cascade: true })
  columns!: Column[];

  @OneToMany(() => Task, (task) => task.board, { cascade: true })
  tasks!: Task[];
}
