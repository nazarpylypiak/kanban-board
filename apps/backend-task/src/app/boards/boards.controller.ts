import { AuthenticatedRequest, JwtAuthGuard } from '@kanban-board/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get()
  fintAll() {
    return this.boardsService.fintAll();
  }

  @Get(':id')
  fintOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBoardDto, @Request() req: AuthenticatedRequest) {
    const ownerId = req.user.sub;
    return this.boardsService.create(ownerId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.boardsService.update(id, name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.boardsService.delete(id);
  }
}
