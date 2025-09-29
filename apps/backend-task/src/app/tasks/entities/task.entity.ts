import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from '@kanban-board/shared';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ nullable: true })
  assignedTo: string;
}
