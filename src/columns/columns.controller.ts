import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ColumnDto } from './dto/column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@ApiTags('Columns')
@Controller('columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a column', description: 'Creates a new column within a board.' })
  @ApiBody({ type: CreateColumnDto, description: 'Data required to create a new column' })
  @ApiResponse({ status: 201, description: 'Column successfully created.', type: ColumnDto })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async createColumn(@Request() req, @Body() createColumnDto: CreateColumnDto) {
    const { boardId, title, description } = createColumnDto;
    return this.columnsService.createColumn(req.user.userId, boardId, title, description);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:boardId')
  @ApiOperation({ summary: 'Get columns by board ID', description: 'Retrieves all columns for a specified board.' })
  @ApiParam({ name: 'boardId', description: 'ID of the board to get columns from' })
  @ApiResponse({ status: 200, description: 'List of columns successfully retrieved.', type: [ColumnDto] })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async getColumnsByBoard(@Request() req, @Param('boardId') boardId: string) {
    console.log('Authenticated user:', req.user);
    return this.columnsService.getColumnsByBoard(req.user.userId, boardId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:columnId')
  @ApiOperation({ summary: 'Update a column', description: 'Updates the details of a column.' })
  @ApiParam({ name: 'columnId', description: 'ID of the column to be updated' })
  @ApiBody({ type: UpdateColumnDto, description: 'Data required to update a column' })
  @ApiResponse({ status: 200, description: 'Column successfully updated.', type: ColumnDto })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Column not found.' })
  async updateColumn(@Request() req, @Param('columnId') columnId: string, @Body() updateColumnDto: UpdateColumnDto) {
    const { title, description } = updateColumnDto;
    return this.columnsService.updateColumn(req.user.userId, columnId, title, description);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':columnId')
  @ApiOperation({ summary: 'Delete a column', description: 'Deletes a column from a board.' })
  @ApiParam({ name: 'columnId', description: 'ID of the column to be deleted' })
  @ApiBody({ description: 'Data required to delete a column', schema: { type: 'object', properties: { boardId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Column successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async deleteColumn(@Request() req, @Param('columnId') columnId: string) {
    const { boardId } = req.body;
    return this.columnsService.deleteColumn(req.user.userId, columnId, boardId);
  }
}