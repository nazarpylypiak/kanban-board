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
  @UseGuards(JwtAuthGuard)
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
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }

  @Patch(':id/move/:columnId')
  @UseGuards(JwtAuthGuard)
  moveTask(
    @Param('id') taskId: string,
    @Param('columnId') columnId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.tasksService.moveTask(taskId, columnId, req.jwtUser);
  }
}
