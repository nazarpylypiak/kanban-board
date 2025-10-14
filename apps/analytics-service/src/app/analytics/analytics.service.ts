import { Task } from '@kanban-board/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  async getTaskStats(boardId: string) {
    // 1️⃣ Total tasks
    const totalTasks = await this.taskRepository.count({
      where: { board: { id: boardId } }
    });

    // 2️⃣ Average completion time (hours)
    const avgResult = await this.taskRepository
      .createQueryBuilder('task')
      .select(
        'AVG(EXTRACT(EPOCH FROM (task.completedAt - task.createdAt)))',
        'avgTime'
      )
      .where('task.boardId = :boardId', { boardId })
      .andWhere('task.completedAt IS NOT NULL')
      .getRawOne<{ avgTime: string }>();

    const averageCompletionTime = avgResult?.avgTime
      ? parseFloat(avgResult.avgTime) / 3600
      : 0;

    // 3️⃣ Tasks per status
    const statusResults = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.column', 'column')
      .select('column.name', 'status')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.boardId = :boardId', { boardId })
      .groupBy('column.name')
      .getRawMany<{ status: string; count: string }>();

    const tasksPerStatus: Record<string, number> = {};
    statusResults.forEach((r) => {
      tasksPerStatus[r.status] = parseInt(r.count, 10);
    });
    // 4️⃣ Tasks per user
    const userResults = await this.taskRepository
      .createQueryBuilder('task')
      .leftJoin('task.assignees', 'user')
      .select('user.email', 'email')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.boardId = :boardId', { boardId })
      .groupBy('user.email')
      .getRawMany<{ email: string; count: string }>();

    const tasksPerUser: Record<string, number> = {};
    userResults.forEach((r) => {
      tasksPerUser[r.email || 'Unassigned'] = parseInt(r.count, 10);
    });

    return {
      totalTasks,
      averageCompletionTime,
      tasksPerStatus,
      tasksPerUser
    };
  }
}
