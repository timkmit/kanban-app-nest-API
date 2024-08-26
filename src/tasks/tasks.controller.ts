import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createTask(@Body() body) {
    const { columnId, title, description, status } = body;
    return this.tasksService.createTask(columnId, title, description, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-column/:columnId')
  async getTasksByColumn(@Param('columnId') columnId: string) {
    return this.tasksService.getTasksByColumn(columnId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':taskId')
  async deleteTask(@Request() req, @Param('taskId') taskId: string) {
    const { columnId } = req.body;
    return this.tasksService.deleteTask(taskId, columnId, req.user.userId);
  }
}