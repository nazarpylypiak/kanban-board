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
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get()
  @Roles('admin', 'user')
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get('profile')
  getProfile(@Req() req: AuthenticatedRequest) {
    if (!req.jwtUser) {
      throw new ForbiddenException('User not authenticated');
    }
    return this.userService.getProfile(req.jwtUser.sub);
  }
}
