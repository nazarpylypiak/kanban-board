// board.entity.ts
import { User } from '@kanban-board/shared';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, { nullable: true })
  owner?: User;

  @ManyToMany(() => User)
  @JoinTable()
  sharedUsers: User[];

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];
}
