import { Controller, Get, Param } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TaskStatsDto } from './dto/task-stats.tdo';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get all task analytics for a board
   * GET /analytics/boards/:boardId
   */
  @Get('boards/:boardId')
  async getBoardAnalytics(
    @Param('boardId') boardId: string
  ): Promise<TaskStatsDto> {
    return this.analyticsService.getTaskStats(boardId);
  }
}
