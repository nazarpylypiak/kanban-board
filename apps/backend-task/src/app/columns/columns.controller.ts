import { AuthenticatedRequest, JwtAuthGuard } from '@kanban-board/shared';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { ColumnsService } from './columns.service';

@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @Get()
  findAll(@Query('boardId') boardId: string) {
    if (boardId) {
      return this.columnsService.findAllByBoardId(boardId);
    }
    return this.columnsService.findAll();
  }

  @Post(':boardId')
  @UseGuards(JwtAuthGuard)
  create(
    @Param('boardId') boardId: string,
    @Body('name') name: string,
    @Req() req: AuthenticatedRequest
  ) {
    const user = req.user;
    return this.columnsService.create({ boardId, name, user });
  }
}
