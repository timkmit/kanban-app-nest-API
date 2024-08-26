import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardsService } from './boards.service';
import { CreateBoardWithColumnsDto } from './dto/create-board-with-columns.dto';

@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createBoard(@Request() req, @Body() body) {
    console.log(req.user); // Должно выводить { userId, username }
    const { title, description } = body;
    return this.boardsService.createBoard(req.user.userId, title, description); 
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-with-columns')
  async createBoardWithColumns(@Request() req, @Body() createBoardWithColumnsDto: CreateBoardWithColumnsDto) {
    const { title, description, columns } = createBoardWithColumnsDto;
    return this.boardsService.createBoardWithColumns(req.user.userId, title, description, columns);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserBoards(@Request() req) {
    console.log('Getting boards for user:', req.user.userId);
    return this.boardsService.getUserBoards(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('share/:boardId')
  async shareBoard(@Request() req, @Param('boardId') boardId: string, @Body() body) {
    const { userId } = body;
    return this.boardsService.shareBoard(boardId, req.user.userId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':boardId')
  async deleteBoard(@Request() req, @Param('boardId') boardId: string) {
    return this.boardsService.deleteBoard(boardId, req.user.userId);
  }
}