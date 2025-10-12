import { AuthenticatedRequest, JwtAuthGuard } from '@kanban-board/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('')
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post(':columnId')
  create(
    @Param('columnId') columnId: string,
    @Body() createTaskTdo: CreateTaskDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.tasksService.create(columnId, createTaskTdo, req.jwtUser);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTaskTdo: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskTdo);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.tasksService.delete(id, req.jwtUser);
  }

  @Patch(':id/move')
  @UseGuards(JwtAuthGuard)
  moveOrReorderTask(
    @Param('id') taskId: string,
    @Body() body: { columnId: string; position?: number },
    @Req() req: AuthenticatedRequest
  ) {
    const { columnId, position } = body;
    return this.tasksService.moveOrReorderTask(
      taskId,
      columnId,
      position,
      req.jwtUser
    );
  }
}
