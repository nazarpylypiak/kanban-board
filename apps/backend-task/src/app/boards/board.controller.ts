import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { BoardService } from "./board.service";

@Controller("boards")
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  fintAll() {
    return this.boardService.fintAll();
  }

  @Get(":id")
  fintOne(@Param("id") id: string) {
    return this.boardService.findOne(id);
  }

  @Post()
  create(@Body("name") name: string) {
    return this.boardService.create(name);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body("name") name: string) {
    return this.boardService.update(id, name);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.boardService.delete(id);
  }
}
