import { Task } from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>
  ) {}

  async getTaskStats(boardId: string) {
    // Total tasks on the board
    const totalTasks = await this.taskRepository.count({
      where: { board: { id: boardId } }
    });

    // Completed tasks
    const completedTasks = await this.taskRepository.find({
      where: {
        board: { id: boardId },
        completedAt: Not(IsNull())
      }
    });

    // Average completion time in hours
    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (task.completedAt.getTime() - task.createdAt.getTime());
    }, 0);

    const averageCompletionTime =
      completedTasks.length > 0
        ? totalTime / completedTasks.length / (1000 * 60 * 60) // hours
        : 0;

    return { totalTasks, averageCompletionTime };
  }
}
