import { Controller, Post, Body, UseGuards, Request, Get, Param, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubtasksService } from './subtasks.service';
import { CreateSubtaskDto } from './dto/create-subtask.dto';

@Controller('subtasks')
export class SubtasksController {
  constructor(private subtasksService: SubtasksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async createSubtask(@Body() createSubtaskDto: CreateSubtaskDto) {
    const { taskId, title, description, status } = createSubtaskDto;
    return this.subtasksService.createSubtask(taskId, title, description, status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('by-task/:taskId')
  async getSubtasksByTask(@Param('taskId') taskId: string) {
    return this.subtasksService.getSubtasksByTask(taskId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':subtaskId')
  async deleteSubtask(@Request() req, @Param('subtaskId') subtaskId: string) {
    const { taskId } = req.body;
    return this.subtasksService.deleteSubtask(subtaskId, taskId, req.user.userId);
  }
}