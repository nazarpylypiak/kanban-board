export type TTaskPer = Record<string, number>;

export interface TaskSummary {
  totalTasks: number;
  averageCompletionTime: number;
}

export interface TaskStats {
  summary: TaskSummary;
  tasksPerStatus: TTaskPer;
  tasksPerUser: TTaskPer;
}
