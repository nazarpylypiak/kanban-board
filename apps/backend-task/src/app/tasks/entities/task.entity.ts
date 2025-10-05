import { TaskStatus } from "@kanban-board/shared";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Board } from "../../boards/entities/board.entity";

@Entity("tasks")
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: "enum", enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ nullable: true })
  assignedTo: string;

  @ManyToOne(() => Board, (board) => board.tasks, { onDelete: "CASCADE" })
  board: Board;
}
