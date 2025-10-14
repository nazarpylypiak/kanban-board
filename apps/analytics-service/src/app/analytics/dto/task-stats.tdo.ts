export interface TaskStatsDto {
  totalTasks: number;
  averageCompletionTime: number; // in hours
  tasksPerStatus: Record<string, number>;
  tasksPerUser: Record<string, number>;
}
