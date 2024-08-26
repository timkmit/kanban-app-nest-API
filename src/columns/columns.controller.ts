import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';

@Controller('columns')
export class ColumnsController {
  constructor(private columnsService: ColumnsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createColumn(@Request() req, @Body() createColumnDto: CreateColumnDto) {
    const { boardId, title, description } = createColumnDto;
    return this.columnsService.createColumn(req.user.userId, boardId, title, description);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:boardId/get')
  async getColumnsByBoard(@Request() req, @Param('boardId') boardId: string) {
    console.log('Authenticated user:', req.user);
    return this.columnsService.getColumnsByBoard(req.user.userId, boardId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':columnId/delete')
  async deleteColumn(@Request() req, @Param('columnId') columnId: string) {
    const { boardId } = req.body;
    return this.columnsService.deleteColumn(req.user.userId, columnId, boardId);
  }
}