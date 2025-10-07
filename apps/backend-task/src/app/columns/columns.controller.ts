import { Controller, Get, Query } from '@nestjs/common';
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
}
