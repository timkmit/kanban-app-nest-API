import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @ApiOperation({ summary: 'Create a task', description: 'Creates a new task within a specified column.' })
  @ApiBody({ type: CreateTaskDto, description: 'Data required to create a new task' })
  @ApiResponse({ status: 201, description: 'Task successfully created.', type: TaskDto })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async createTask(@Body() body: CreateTaskDto) {
    const { columnId, title, description, status } = body;
    return this.tasksService.createTask(columnId, title, description, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-column/:columnId')
  @ApiOperation({ summary: 'Get tasks by column ID', description: 'Retrieves all tasks for a specified column.' })
  @ApiParam({ name: 'columnId', description: 'ID of the column to get tasks from' })
  @ApiResponse({ status: 200, description: 'List of tasks successfully retrieved.', type: [TaskDto] })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async getTasksByColumn(@Param('columnId') columnId: string) {
    return this.tasksService.getTasksByColumn(columnId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:taskId')
  @ApiOperation({ summary: 'Update a task', description: 'Updates the details of a task.' })
  @ApiParam({ name: 'taskId', description: 'ID of the task to be updated' })
  @ApiBody({ type: UpdateTaskDto, description: 'Data required to update a task' })
  @ApiResponse({ status: 200, description: 'Task successfully updated.', type: TaskDto })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async updateTask(@Request() req, @Param('taskId') taskId: string, @Body() updateTaskDto: UpdateTaskDto) {
    const { title, description, status } = updateTaskDto;
    return this.tasksService.updateTask(taskId, req.user.userId, title, description, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-with-subtasks/:taskId')
  @ApiOperation({ summary: 'Update a task with subtasks', description: 'Updates the task and its subtasks.' })
  @ApiParam({ name: 'taskId', description: 'ID of the task to be updated' })
  @ApiBody({
    description: 'Data required to update the task and its subtasks',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Task Title' },
        description: { type: 'string', example: 'Updated Task Description' },
        status: { type: 'string', example: 'In Progress' }, 
        subtasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'subtaskId', nullable: true },
              title: { type: 'string', example: 'New Subtask Title' },
              description: { type: 'string', example: 'New Subtask Description', nullable: true },
              isDone: { type: 'boolean', example: true }, 
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Task and subtasks successfully updated.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  async updateTaskWithSubtasks(
    @Param('taskId') taskId: string,
    @Request() req,
    @Body() body,
  ) {
    const { title, description, status, subtasks } = body;
    return this.tasksService.updateTaskWithSubtasks(taskId, req.user.userId, { title, description, status }, subtasks);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':taskId')
  @ApiOperation({ summary: 'Delete a task', description: 'Deletes a task from a column.' })
  @ApiParam({ name: 'taskId', description: 'ID of the task to be deleted' })
  @ApiBody({ description: 'Data required to delete a task', schema: { type: 'object', properties: { columnId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Task successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Access forbidden.' })
  async deleteTask(@Request() req, @Param('taskId') taskId: string) {
    const { columnId } = req.body;
    return this.tasksService.deleteTask(taskId, columnId, req.user.userId);
  }
}