import {
  AuthenticatedRequest,
  JwtAuthGuard,
  Roles,
  RolesGuard
} from '@kanban-board/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get('columns')
  @Roles('admin', 'user')
  findAll() {
    return this.columnsService.findAll();
  }

  @Get('boards/:boardId/columns')
  findBoardColumns(
    @Param('boardId') boardId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.columnsService.findBoardColumns(boardId, req.jwtUser);
  }

  @Post('boards/:boardId/columns')
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.columnsService.createBoardColumn(
      { ...dto, boardId },
      req.jwtUser
    );
  }

  @Patch('columns/:columnId')
  updateColumn(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.columnsService.update(columnId, dto, req.jwtUser);
  }

  @Delete('columns/:columnId')
  deleteColumn(
    @Param('columnId') columnId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.columnsService.delete(columnId, req.jwtUser);
  }
}
