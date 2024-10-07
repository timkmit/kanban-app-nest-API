import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubtaskDto } from './dto/subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';

@ApiTags('Subtasks')
@Controller('subtasks')
export class SubtasksController {
  constructor(private readonly subtasksService: SubtasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a subtask', description: 'Creates a new subtask for a specified task.' })
  @ApiBody({ type: CreateSubtaskDto, description: 'Data required to create a new subtask' })
  @ApiResponse({ status: 201, description: 'Subtask successfully created.', type: SubtaskDto })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async createSubtask(@Body() createSubtaskDto: CreateSubtaskDto) {
    const { taskId, title, description, isDone } = createSubtaskDto;
    return this.subtasksService.createSubtask(taskId, title, description, isDone);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-task/:taskId')
  @ApiOperation({ summary: 'Get subtasks by task ID', description: 'Retrieves all subtasks for a specified task.' })
  @ApiParam({ name: 'taskId', description: 'ID of the task to get subtasks from' })
  @ApiResponse({ status: 200, description: 'List of subtasks successfully retrieved.', type: [SubtaskDto] })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async getSubtasksByTask(@Param('taskId') taskId: string) {
    return this.subtasksService.getSubtasksByTask(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:subtaskId')
  @ApiOperation({ summary: 'Update a subtask', description: 'Updates the details of a subtask.' })
  @ApiParam({ name: 'subtaskId', description: 'ID of the subtask to be updated' })
  @ApiBody({ type: UpdateSubtaskDto, description: 'Data required to update a subtask' })
  @ApiResponse({ status: 200, description: 'Subtask successfully updated.', type: SubtaskDto })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Subtask not found.' })
  async updateSubtask(
    @Request() req, 
    @Param('subtaskId') subtaskId: string, 
    @Body() updateSubtaskDto: UpdateSubtaskDto
  ) {
    const { title, description, isDone } = updateSubtaskDto;
    return this.subtasksService.updateSubtask(subtaskId, req.user.userId, title, description, isDone);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':subtaskId')
  @ApiOperation({ summary: 'Delete a subtask', description: 'Deletes a subtask from a task.' })
  @ApiParam({ name: 'subtaskId', description: 'ID of the subtask to be deleted' })
  @ApiBody({ description: 'Data required to delete a subtask', schema: { type: 'object', properties: { taskId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Subtask successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async deleteSubtask(@Request() req, @Param('subtaskId') subtaskId: string, @Body('taskId') taskId: string) {
    return this.subtasksService.deleteSubtask(subtaskId, taskId, req.user.userId);
  }
}