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
  Query,
  Req,
  UseGuards
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { ShareBoardDto } from './dto/share-board.dto';

@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('my-boards')
  async getBoards(@Req() req: AuthenticatedRequest) {
    return this.boardsService.findAllForUser(req.jwtUser.sub, req.jwtUser.role);
  }

  @Get()
  findAll(@Query('ownerId') ownerId: string) {
    if (ownerId) {
      return this.boardsService.findAllByOwner(ownerId);
    }
    return this.boardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(id);
  }

  @Get(':boardId/users')
  findBoardUsers(
    @Param('boardId') boardId: string,
    @Req() req: AuthenticatedRequest
  ) {
    return this.boardsService.findBoardUsers(boardId, req.jwtUser);
  }

  @Post()
  create(@Body() dto: CreateBoardDto, @Req() req: AuthenticatedRequest) {
    const ownerId = req.jwtUser.sub;
    return this.boardsService.create(ownerId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.boardsService.update(id, name);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.boardsService.delete(id, req.jwtUser);
  }

  @Patch(':boardId/share')
  shareBoard(
    @Param('boardId') boardId: string,
    @Body() dto: ShareBoardDto,
    @Req() req: AuthenticatedRequest
  ) {
    return this.boardsService.shareBoard(boardId, dto, req.jwtUser);
  }
}
