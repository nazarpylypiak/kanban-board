import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Board } from "./entities/board.entity";

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board) private boardRepository: Repository<Board>,
  ) {}

  fintAll() {
    return this.boardRepository.find({ relations: ["tasks"] });
  }

  findOne(id: string) {
    return this.boardRepository.findOne({
      where: { id },
      relations: ["tasks"],
    });
  }

  create(name: string) {
    const board = this.boardRepository.create({ name });
    return this.boardRepository.save(board);
  }

  update(id: string, name: string) {
    return this.boardRepository.update(id, { name });
  }

  delete(id: string) {
    return this.boardRepository.delete(id);
  }
}
