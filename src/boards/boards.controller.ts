import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BoardsService } from './boards.service';
import { CreateBoardWithColumnsDto } from './dto/create-board-with-columns.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@ApiTags('Boards')
@Controller('boards')
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a board', description: 'Creates a new board for the user.' })
  @ApiBody({ type: CreateBoardDto, description: 'Data required to create a new board' })
  @ApiResponse({ status: 201, description: 'Board successfully created.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async createBoard(@Request() req, @Body() createBoardDto: CreateBoardDto) {
    const { title, description } = createBoardDto;
    return this.boardsService.createBoard(req.user.userId, title, description);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-with-columns')
  @ApiOperation({ summary: 'Create a board with columns', description: 'Creates a new board with the specified columns.' })
  @ApiBody({ type: CreateBoardWithColumnsDto, description: 'Data required to create a board with columns' })
  @ApiResponse({ status: 201, description: 'Board with columns successfully created.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async createBoardWithColumns(@Request() req, @Body() createBoardWithColumnsDto: CreateBoardWithColumnsDto) {
    const { title, description, columns } = createBoardWithColumnsDto;
    return this.boardsService.createBoardWithColumns(req.user.userId, title, description, columns);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get user boards', description: 'Returns a list of boards for the current user.' })
  @ApiResponse({ status: 200, description: 'List of boards successfully retrieved.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async getUserBoards(@Request() req) {
    return this.boardsService.getUserBoards(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('details')
  @ApiOperation({ summary: 'Get detailed user boards', description: 'Returns a list of boards for the current user with all related details.' })
  @ApiResponse({ status: 200, description: 'List of detailed boards successfully retrieved.', type: [CreateBoardDto] })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async getUserBoardsWithDetails(@Request() req): Promise<CreateBoardDto[]> {
    return this.boardsService.getUserBoardsWithDetails(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('share/:boardId')
  @ApiOperation({ summary: 'Share a board', description: 'Shares a board with another user via email.' })
  @ApiParam({ name: 'boardId', description: 'ID of the board to be shared' })
  @ApiBody({
    description: 'Data required to share a board',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Board successfully shared.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async shareBoard(@Request() req, @Param('boardId') boardId: string, @Body() body) {
    const { email } = body;
    return this.boardsService.shareBoard(boardId, req.user.userId, email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:boardId')
  @ApiOperation({ summary: 'Update a board', description: 'Updates the title or description of the specified board.' })
  @ApiParam({ name: 'boardId', description: 'ID of the board to be updated' })
  @ApiBody({ type: UpdateBoardDto, description: 'Data required to update the board' })
  @ApiResponse({ status: 200, description: 'Board successfully updated.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async updateBoard(@Param('boardId') boardId: string, @Body() updateBoardDto: UpdateBoardDto, @Request() req) {
    return this.boardsService.updateBoard(boardId, req.user.userId, updateBoardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':boardId')
  @ApiOperation({ summary: 'Delete a board', description: 'Deletes the user\'s board.' })
  @ApiParam({ name: 'boardId', description: 'ID of the board to be deleted' })
  @ApiResponse({ status: 200, description: 'Board successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async deleteBoard(@Request() req, @Param('boardId') boardId: string) {
    return this.boardsService.deleteBoard(boardId, req.user.userId);
  }


}